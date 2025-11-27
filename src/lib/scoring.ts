// Tibok Medical Evaluation - T-MCQ Scoring System
// T-MCQ = Tibok Medical Quality Composite

import type { TMCQScore, AIAuditOutput } from '../types/medical'

export const TMCQ_WEIGHTS = {
  clinical: 0.40,      // Compétence clinique
  safety: 0.30,        // Sécurité (Red Flags)
  prescription: 0.15,  // Prescription & guidelines
  documentation: 0.10, // Dossier médical
  communication: 0.05  // Communication
}

export const TMCQ_THRESHOLDS = {
  apte: 85,
  supervision: 70,
  formation_requise: 0
}

/**
 * Calcule le score T-MCQ global à partir des différents composants
 */
export function calculateTMCQ(
  qcmScore: number,
  clinicalCasesScore: number,
  aiAuditScore: number
): TMCQScore {
  // Calcul des composants
  const clinical = (qcmScore * 0.6 + clinicalCasesScore * 0.4) // Compétence théorique + pratique
  const safety = aiAuditScore // Score red flags de l'IA
  const prescription = aiAuditScore // Même base que safety
  const documentation = aiAuditScore // Qualité du dossier
  const communication = aiAuditScore // Communication

  // Score total pondéré
  const total = Math.round(
    clinical * TMCQ_WEIGHTS.clinical +
    safety * TMCQ_WEIGHTS.safety +
    prescription * TMCQ_WEIGHTS.prescription +
    documentation * TMCQ_WEIGHTS.documentation +
    communication * TMCQ_WEIGHTS.communication
  )

  // Détermination du status (IMPORTANT: Must match DB constraint: 'apte', 'supervision', 'formation_requise')
  let status: 'apte' | 'supervision' | 'formation_requise'
  if (total >= TMCQ_THRESHOLDS.apte) {
    status = 'apte'
  } else if (total >= TMCQ_THRESHOLDS.supervision) {
    status = 'supervision'  // Doit correspondre EXACTEMENT à la contrainte DB
  } else {
    status = 'formation_requise'  // Doit correspondre EXACTEMENT à la contrainte DB
  }

  return {
    clinical: Math.round(clinical),
    safety: Math.round(safety),
    prescription: Math.round(prescription),
    documentation: Math.round(documentation),
    communication: Math.round(communication),
    total,
    status
  }
}

/**
 * Calcule le score global à partir d'un audit IA
 */
export function calculateAIGlobalScore(aiOutput: AIAuditOutput): number {
  return Math.round(
    aiOutput.anamnese_score * 0.30 +
    aiOutput.diagnostic_score * 0.30 +
    aiOutput.prescription_score * 0.20 +
    aiOutput.red_flags_score * 0.15 +
    aiOutput.communication_score * 0.05
  )
}

/**
 * Détermine si une alerte doit être créée
 */
export function shouldCreateAlert(aiOutput: AIAuditOutput): boolean {
  // Alerte si :
  // - Score global < 70
  // - Red flags manqués
  // - Prescription non conforme
  // - Severity high
  
  if (aiOutput.global_tmcq_score < 70) return true
  if (aiOutput.red_flags_missed.length > 0) return true
  if (!aiOutput.prescription_analysis.who_eml_compliant) return true
  if (aiOutput.severity === 'high') return true
  
  return false
}

/**
 * Génère le message d'alerte approprié
 */
export function generateAlertMessage(aiOutput: AIAuditOutput): {
  type: 'low_score' | 'red_flag_missed' | 'non_compliance' | 'prescription_error'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
} {
  // Red flags manqués = priorité critique
  if (aiOutput.red_flags_missed.length > 0) {
    return {
      type: 'red_flag_missed',
      message: `Red flags non détectés : ${aiOutput.red_flags_missed.join(', ')}. Supervision immédiate requise.`,
      severity: 'critical'
    }
  }

  // Prescription non conforme WHO EML
  if (!aiOutput.prescription_analysis.who_eml_compliant) {
    return {
      type: 'prescription_error',
      message: 'Prescription non conforme WHO Essential Medicines List 2023. Révision nécessaire.',
      severity: 'high'
    }
  }

  // Score faible
  if (aiOutput.global_tmcq_score < 70) {
    return {
      type: 'low_score',
      message: `Score T-MCQ insuffisant (${aiOutput.global_tmcq_score}/100). Formation complémentaire recommandée.`,
      severity: aiOutput.global_tmcq_score < 50 ? 'high' : 'medium'
    }
  }

  // Autres non-conformités
  return {
    type: 'non_compliance',
    message: 'Non-conformité détectée aux guidelines OMS. Révision de la consultation requise.',
    severity: aiOutput.severity
  }
}

/**
 * Calcule les statistiques pour un médecin
 */
export function calculateDoctorStats(evaluations: any[]) {
  if (evaluations.length === 0) {
    return {
      average_tmcq: 0,
      trend: 'stable',
      total_evaluations: 0,
      last_evaluation: null
    }
  }

  const avgTMCQ = evaluations.reduce((sum, e) => sum + e.tmcq_total, 0) / evaluations.length

  // Calcul de la tendance (3 dernières évaluations)
  let trend = 'stable'
  if (evaluations.length >= 3) {
    const recent = evaluations.slice(-3).map(e => e.tmcq_total)
    const oldAvg = (recent[0] + recent[1]) / 2
    const newAvg = recent[2]
    
    if (newAvg > oldAvg + 5) trend = 'improving'
    else if (newAvg < oldAvg - 5) trend = 'declining'
  }

  return {
    average_tmcq: Math.round(avgTMCQ),
    trend,
    total_evaluations: evaluations.length,
    last_evaluation: evaluations[evaluations.length - 1]
  }
}
