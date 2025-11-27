// Tibok Medical Evaluation - Evaluation Templates Routes
// Gestion des modèles d'évaluation

import { Hono } from 'hono'
import type { Bindings } from '../types/medical'

const evaluations = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/evaluations/templates
 * Liste tous les modèles d'évaluation
 */
evaluations.get('/templates', async (c) => {
  try {
    const active = c.req.query('active')
    
    let query = `
      SELECT 
        et.*,
        (SELECT COUNT(*) FROM evaluation_template_qcm WHERE template_id = et.id) as qcm_count,
        (SELECT COUNT(*) FROM evaluation_template_cases WHERE template_id = et.id) as case_count
      FROM evaluation_templates et
    `
    
    const params: any[] = []
    
    if (active !== undefined) {
      query += ' WHERE et.is_active = ?'
      params.push(parseInt(active))
    }
    
    query += ' ORDER BY et.created_at DESC'
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      templates: result.results
    })
  } catch (error: any) {
    console.error('List Templates Error:', error)
    return c.json({ error: error.message || 'Failed to fetch templates' }, 500)
  }
})

/**
 * GET /api/evaluations/templates/:id
 * Détails complets d'un modèle d'évaluation
 */
evaluations.get('/templates/:id', async (c) => {
  try {
    const templateId = c.req.param('id')
    
    // Récupérer le template
    const template = await c.env.DB.prepare('SELECT * FROM evaluation_templates WHERE id = ?')
      .bind(templateId)
      .first()
    
    if (!template) {
      return c.json({ error: 'Template not found' }, 404)
    }
    
    // Récupérer les QCM associés
    const qcms = await c.env.DB.prepare(`
      SELECT 
        gq.*,
        etq.order_index,
        etq.weight
      FROM evaluation_template_qcm etq
      JOIN generated_qcm gq ON etq.qcm_id = gq.id
      WHERE etq.template_id = ?
      ORDER BY etq.order_index
    `).bind(templateId).all()
    
    // Récupérer les cas cliniques associés
    const cases = await c.env.DB.prepare(`
      SELECT 
        cc.*,
        etc.order_index,
        etc.weight
      FROM evaluation_template_cases etc
      JOIN clinical_cases cc ON etc.case_id = cc.id
      WHERE etc.template_id = ?
      ORDER BY etc.order_index
    `).bind(templateId).all()
    
    return c.json({
      success: true,
      template,
      qcms: qcms.results.map(q => ({
        ...q,
        options: JSON.parse(q.options as string),
        tags: JSON.parse(q.tags as string)
      })),
      cases: cases.results.map(c => ({
        ...c,
        patient_profile: JSON.parse(c.patient_profile as string),
        anamnesis: JSON.parse(c.anamnesis as string),
        questions: JSON.parse(c.questions as string),
        red_flags: JSON.parse(c.red_flags as string),
        prescription: JSON.parse(c.prescription as string)
      }))
    })
  } catch (error: any) {
    console.error('Get Template Error:', error)
    return c.json({ error: error.message || 'Failed to fetch template' }, 500)
  }
})

/**
 * POST /api/evaluations/templates
 * Créer un nouveau modèle d'évaluation
 */
evaluations.post('/templates', async (c) => {
  try {
    const { name, description, duration_minutes, passing_score, qcm_ids, case_ids } = await c.req.json()
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400)
    }
    
    const templateId = `eval-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // Créer le template
    await c.env.DB.prepare(`
      INSERT INTO evaluation_templates (id, name, description, duration_minutes, passing_score, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      templateId,
      name,
      description || '',
      duration_minutes || 60,
      passing_score || 75.0
    ).run()
    
    // Ajouter les QCM
    if (qcm_ids && qcm_ids.length > 0) {
      for (let i = 0; i < qcm_ids.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO evaluation_template_qcm (template_id, qcm_id, order_index, weight)
          VALUES (?, ?, ?, ?)
        `).bind(templateId, qcm_ids[i], i, 1.0).run()
      }
    }
    
    // Ajouter les cas cliniques
    if (case_ids && case_ids.length > 0) {
      for (let i = 0; i < case_ids.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO evaluation_template_cases (template_id, case_id, order_index, weight)
          VALUES (?, ?, ?, ?)
        `).bind(templateId, case_ids[i], i, 2.0).run()
      }
    }
    
    return c.json({
      success: true,
      template_id: templateId,
      message: 'Evaluation template created successfully'
    })
  } catch (error: any) {
    console.error('Create Template Error:', error)
    return c.json({ error: error.message || 'Failed to create template' }, 500)
  }
})

/**
 * PUT /api/evaluations/templates/:id
 * Mettre à jour un modèle d'évaluation
 */
evaluations.put('/templates/:id', async (c) => {
  try {
    const templateId = c.req.param('id')
    const { name, description, duration_minutes, passing_score, is_active } = await c.req.json()
    
    const updates: string[] = []
    const params: any[] = []
    
    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (duration_minutes !== undefined) {
      updates.push('duration_minutes = ?')
      params.push(duration_minutes)
    }
    if (passing_score !== undefined) {
      updates.push('passing_score = ?')
      params.push(passing_score)
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(is_active ? 1 : 0)
    }
    
    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400)
    }
    
    updates.push("updated_at = datetime('now')")
    params.push(templateId)
    
    await c.env.DB.prepare(`
      UPDATE evaluation_templates
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run()
    
    return c.json({
      success: true,
      message: 'Template updated successfully'
    })
  } catch (error: any) {
    console.error('Update Template Error:', error)
    return c.json({ error: error.message || 'Failed to update template' }, 500)
  }
})

/**
 * DELETE /api/evaluations/templates/:id
 * Supprimer un modèle d'évaluation
 */
evaluations.delete('/templates/:id', async (c) => {
  try {
    const templateId = c.req.param('id')
    
    await c.env.DB.prepare('DELETE FROM evaluation_templates WHERE id = ?')
      .bind(templateId)
      .run()
    
    return c.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete Template Error:', error)
    return c.json({ error: error.message || 'Failed to delete template' }, 500)
  }
})

/**
 * GET /api/evaluations/:id/narrative-report
 * Générer un rapport narratif et formatif détaillé
 */
evaluations.get('/:id/narrative-report', async (c) => {
  try {
    const evaluationId = c.req.param('id')
    
    // Récupérer l'évaluation complète
    const evaluation = await c.env.DB.prepare(`
      SELECT 
        de.*,
        d.name as doctor_name,
        d.email as doctor_email,
        d.specialty as doctor_specialty,
        d.license_number as doctor_license
      FROM doctors_evaluations de
      JOIN doctors d ON de.doctor_id = d.id
      WHERE de.id = ?
    `).bind(evaluationId).first()
    
    if (!evaluation) {
      return c.json({ error: 'Evaluation not found' }, 404)
    }
    
    // Récupérer les réponses détaillées
    const responses = await c.env.DB.prepare(`
      SELECT * FROM evaluation_responses
      WHERE evaluation_id = ?
      ORDER BY question_order
    `).bind(evaluationId).all()
    
    // Analyser les performances
    const qcmResponses = responses.results.filter((r: any) => r.question_type === 'qcm')
    const caseResponses = responses.results.filter((r: any) => r.question_type === 'clinical_case')
    
    // Identifier les points forts et faibles
    const strongAreas: string[] = []
    const weakAreas: string[] = []
    const improvementSuggestions: string[] = []
    
    // Analyser QCM
    const qcmCorrect = qcmResponses.filter((r: any) => r.is_correct === 1).length
    const qcmTotal = qcmResponses.length
    const qcmScore = qcmTotal > 0 ? (qcmCorrect / qcmTotal) * 100 : 0
    
    if (qcmScore >= 80) {
      strongAreas.push('Excellente maîtrise des connaissances théoriques')
    } else if (qcmScore >= 60) {
      weakAreas.push('Connaissances théoriques à consolider')
      improvementSuggestions.push('Réviser les concepts fondamentaux et les protocoles standards')
    } else {
      weakAreas.push('Lacunes importantes dans les connaissances théoriques')
      improvementSuggestions.push('Formation approfondie nécessaire sur les bases médicales')
    }
    
    // Analyser cas cliniques
    const caseCorrect = caseResponses.filter((r: any) => r.is_correct === 1).length
    const caseTotal = caseResponses.length
    const caseScore = caseTotal > 0 ? (caseCorrect / caseTotal) * 100 : 0
    
    if (caseScore >= 80) {
      strongAreas.push('Excellente capacité de raisonnement clinique')
    } else if (caseScore >= 60) {
      weakAreas.push('Raisonnement clinique perfectible')
      improvementSuggestions.push('Pratiquer l\'analyse de cas cliniques complexes')
    } else {
      weakAreas.push('Difficultés dans le raisonnement clinique appliqué')
      improvementSuggestions.push('Formation pratique intensive sur des cas réels supervisés')
    }
    
    // Analyser les drapeaux rouges si disponibles
    const redFlagsMissed = caseResponses.filter((r: any) => 
      !r.is_correct && r.question_text && r.question_text.toLowerCase().includes('red flag')
    ).length
    
    if (redFlagsMissed > 0) {
      weakAreas.push(`${redFlagsMissed} drapeaux rouges manqués`)
      improvementSuggestions.push('Formation spécifique sur l\'identification des signes d\'alerte critiques')
    }
    
    // Score T-MCQ global
    const tmcqScore = evaluation.tmcq_total || 0
    
    // Déterminer le niveau de compétence
    let competenceLevel = ''
    let competenceDescription = ''
    
    if (tmcqScore >= 85) {
      competenceLevel = 'Expert'
      competenceDescription = 'Le médecin démontre une maîtrise exceptionnelle des compétences requises pour la téléconsultation. Capacité à gérer des cas complexes de manière autonome.'
    } else if (tmcqScore >= 70) {
      competenceLevel = 'Compétent'
      competenceDescription = 'Le médecin possède les compétences de base nécessaires avec quelques axes d\'amélioration. Apte à exercer sous supervision occasionnelle.'
    } else if (tmcqScore >= 50) {
      competenceLevel = 'En développement'
      competenceDescription = 'Le médecin présente des lacunes significatives nécessitant une formation ciblée. Supervision rapprochée recommandée.'
    } else {
      competenceLevel = 'Débutant'
      competenceDescription = 'Formation intensive requise avant d\'exercer en téléconsultation. Supervision constante obligatoire.'
    }
    
    // Recommandations personnalisées
    const recommendations: string[] = []
    
    if (tmcqScore < 70) {
      recommendations.push('Suivre un module de formation sur les fondamentaux de la téléconsultation')
      recommendations.push('Participer à des sessions de simulation de consultations')
    }
    
    if (qcmScore < 70) {
      recommendations.push('Réviser les protocoles médicaux standards')
      recommendations.push('Étudier les guidelines internationales pertinentes')
    }
    
    if (caseScore < 70) {
      recommendations.push('Pratiquer l\'analyse de cas cliniques supervisée')
      recommendations.push('Observer des consultations de médecins expérimentés')
    }
    
    if (redFlagsMissed > 0) {
      recommendations.push('Formation spécifique sur l\'identification des urgences médicales')
      recommendations.push('Réviser les critères de référence vers les urgences')
    }
    
    // Objectifs d\'apprentissage
    const learningObjectives: string[] = []
    
    if (qcmScore < 80) {
      learningObjectives.push('Améliorer la maîtrise des connaissances théoriques à 80%+')
    }
    if (caseScore < 80) {
      learningObjectives.push('Développer le raisonnement clinique pratique à 80%+')
    }
    if (tmcqScore < 85) {
      learningObjectives.push('Atteindre le score T-MCQ de 85% pour une pratique autonome')
    }
    
    // Plan d\'action
    const actionPlan = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    }
    
    if (evaluation.status === 'formation_requise') {
      actionPlan.immediate.push('Suspendre l\'activité de téléconsultation non supervisée')
      actionPlan.immediate.push('Rencontrer le responsable de formation pour un plan personnalisé')
      actionPlan.shortTerm.push('Compléter le module de formation obligatoire (durée estimée: 2-4 semaines)')
      actionPlan.shortTerm.push('Passer une réévaluation complète')
      actionPlan.longTerm.push('Continuer la formation continue avec évaluations trimestrielles')
    } else if (evaluation.status === 'supervision_requise') {
      actionPlan.immediate.push('Exercer uniquement sous supervision d\'un médecin expérimenté')
      actionPlan.shortTerm.push('Améliorer les compétences identifiées comme faibles (4-8 semaines)')
      actionPlan.shortTerm.push('Documenter 20 cas supervisés avec feedback')
      actionPlan.longTerm.push('Réévaluation dans 3 mois pour passage en pratique autonome')
    } else {
      actionPlan.immediate.push('Continuer la pratique avec évaluations régulières')
      actionPlan.shortTerm.push('Maintenir les compétences avec formation continue')
      actionPlan.longTerm.push('Réévaluation annuelle pour confirmation des compétences')
    }
    
    return c.json({
      success: true,
      report: {
        // Informations générales
        evaluation_id: evaluationId,
        doctor: {
          name: evaluation.doctor_name,
          email: evaluation.doctor_email,
          specialty: evaluation.doctor_specialty,
          license: evaluation.doctor_license
        },
        evaluation_date: evaluation.evaluation_date,
        evaluation_name: 'Évaluation TIBOK Téléconsultation',
        
        // Scores
        scores: {
          tmcq: tmcqScore,
          qcm: qcmScore,
          clinical_cases: caseScore,
          qcm_details: `${qcmCorrect}/${qcmTotal}`,
          case_details: `${caseCorrect}/${caseTotal}`
        },
        
        // Statut et niveau
        status: evaluation.status,
        competence_level: competenceLevel,
        competence_description: competenceDescription,
        
        // Analyse détaillée
        analysis: {
          strong_areas: strongAreas,
          weak_areas: weakAreas,
          red_flags_missed: redFlagsMissed
        },
        
        // Recommandations
        recommendations: recommendations,
        improvement_suggestions: improvementSuggestions,
        learning_objectives: learningObjectives,
        
        // Plan d'action
        action_plan: actionPlan,
        
        // Conclusion narrative
        conclusion: generateNarrativeConclusion(
          evaluation,
          tmcqScore,
          qcmScore,
          caseScore,
          competenceLevel
        )
      }
    })
  } catch (error: any) {
    console.error('Generate Narrative Report Error:', error)
    return c.json({ error: error.message || 'Failed to generate report' }, 500)
  }
})

/**
 * Fonction helper pour générer une conclusion narrative
 */
function generateNarrativeConclusion(
  evaluation: any,
  tmcqScore: number,
  qcmScore: number,
  caseScore: number,
  competenceLevel: string
): string {
  let conclusion = `**Rapport d'évaluation TIBOK pour ${evaluation.doctor_name}**\n\n`
  
  conclusion += `Le médecin a complété l'évaluation le ${new Date(evaluation.evaluation_date).toLocaleDateString('fr-FR')}. `
  
  conclusion += `Les résultats globaux montrent un score T-MCQ de ${tmcqScore.toFixed(1)}%, ce qui correspond à un niveau de compétence "${competenceLevel}". `
  
  if (tmcqScore >= 85) {
    conclusion += `Ce score excellent indique une maîtrise complète des compétences requises pour la pratique de la téléconsultation en autonomie. `
  } else if (tmcqScore >= 70) {
    conclusion += `Ce score satisfaisant indique que le médecin possède les compétences de base, mais présente des axes d'amélioration identifiés. `
  } else {
    conclusion += `Ce score insuffisant indique des lacunes importantes nécessitant une formation complémentaire avant toute pratique autonome. `
  }
  
  conclusion += `\n\nL'analyse détaillée révèle:\n`
  conclusion += `- **Connaissances théoriques (QCM)**: ${qcmScore.toFixed(0)}% - `
  
  if (qcmScore >= 80) {
    conclusion += `Excellente maîtrise des concepts fondamentaux.\n`
  } else if (qcmScore >= 60) {
    conclusion += `Connaissances acceptables mais à consolider.\n`
  } else {
    conclusion += `Lacunes importantes nécessitant une révision approfondie.\n`
  }
  
  conclusion += `- **Raisonnement clinique (Cas cliniques)**: ${caseScore.toFixed(0)}% - `
  
  if (caseScore >= 80) {
    conclusion += `Excellente capacité d'analyse et de décision clinique.\n`
  } else if (caseScore >= 60) {
    conclusion += `Capacité de raisonnement à développer.\n`
  } else {
    conclusion += `Difficultés significatives dans l'application pratique des connaissances.\n`
  }
  
  conclusion += `\n**Recommandations**: `
  
  if (evaluation.status === 'apte') {
    conclusion += `Le médecin est **APTE** à pratiquer la téléconsultation. Une évaluation annuelle est recommandée pour maintenir les compétences.`
  } else if (evaluation.status === 'supervision_requise') {
    conclusion += `Le médecin nécessite une **SUPERVISION** durant sa pratique. Une réévaluation est recommandée après une période de formation ciblée de 3 mois.`
  } else {
    conclusion += `Le médecin nécessite une **FORMATION INTENSIVE** avant de pratiquer la téléconsultation. Une formation complète suivie d'une réévaluation complète est obligatoire.`
  }
  
  conclusion += `\n\nCe rapport vise à accompagner le médecin dans son développement professionnel continu et à garantir une qualité de soins optimale en téléconsultation.`
  
  return conclusion
}

/**
 * POST /api/evaluations/templates/:id/qcm
 * Ajouter des QCM à un template
 */
evaluations.post('/templates/:id/qcm', async (c) => {
  try {
    const templateId = c.req.param('id')
    const { qcm_ids } = await c.req.json()
    
    if (!qcm_ids || qcm_ids.length === 0) {
      return c.json({ error: 'QCM IDs required' }, 400)
    }
    
    // Récupérer l'index max actuel
    const maxIndex = await c.env.DB.prepare(
      'SELECT COALESCE(MAX(order_index), -1) as max_index FROM evaluation_template_qcm WHERE template_id = ?'
    ).bind(templateId).first()
    
    let startIndex = (maxIndex?.max_index as number) + 1
    
    for (const qcmId of qcm_ids) {
      await c.env.DB.prepare(`
        INSERT INTO evaluation_template_qcm (template_id, qcm_id, order_index, weight)
        VALUES (?, ?, ?, ?)
      `).bind(templateId, qcmId, startIndex++, 1.0).run()
    }
    
    return c.json({
      success: true,
      message: 'QCM added to template'
    })
  } catch (error: any) {
    console.error('Add QCM Error:', error)
    return c.json({ error: error.message || 'Failed to add QCM' }, 500)
  }
})

/**
 * POST /api/evaluations/templates/:id/cases
 * Ajouter des cas cliniques à un template
 */
evaluations.post('/templates/:id/cases', async (c) => {
  try {
    const templateId = c.req.param('id')
    const { case_ids } = await c.req.json()
    
    if (!case_ids || case_ids.length === 0) {
      return c.json({ error: 'Case IDs required' }, 400)
    }
    
    // Récupérer l'index max actuel
    const maxIndex = await c.env.DB.prepare(
      'SELECT COALESCE(MAX(order_index), -1) as max_index FROM evaluation_template_cases WHERE template_id = ?'
    ).bind(templateId).first()
    
    let startIndex = (maxIndex?.max_index as number) + 1
    
    for (const caseId of case_ids) {
      await c.env.DB.prepare(`
        INSERT INTO evaluation_template_cases (template_id, case_id, order_index, weight)
        VALUES (?, ?, ?, ?)
      `).bind(templateId, caseId, startIndex++, 2.0).run()
    }
    
    return c.json({
      success: true,
      message: 'Cases added to template'
    })
  } catch (error: any) {
    console.error('Add Cases Error:', error)
    return c.json({ error: error.message || 'Failed to add cases' }, 500)
  }
})

/**
 * POST /api/evaluations/start
 * Démarrer une nouvelle évaluation pour un médecin
 */
evaluations.post('/start', async (c) => {
  try {
    const { template_id } = await c.req.json()
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Extract doctor_id from token (simple approach for now)
    const token = authHeader.substring(7) // Remove 'Bearer '
    const payload = JSON.parse(atob(token.split('.')[1]))
    const doctorId = payload.doctor_id
    
    if (!template_id) {
      return c.json({ error: 'Template ID required' }, 400)
    }
    
    // Get template details with QCMs and cases
    const template = await c.env.DB.prepare('SELECT * FROM evaluation_templates WHERE id = ? AND is_active = 1')
      .bind(template_id)
      .first()
    
    if (!template) {
      return c.json({ error: 'Template not found or not active' }, 404)
    }
    
    // Get QCMs
    const qcms = await c.env.DB.prepare(`
      SELECT 
        gq.id, gq.topic, gq.category, gq.difficulty, gq.question, gq.options, gq.correct_answer, gq.justification, gq.source
      FROM evaluation_template_qcm etq
      JOIN generated_qcm gq ON etq.qcm_id = gq.id
      WHERE etq.template_id = ?
      ORDER BY etq.order_index
    `).bind(template_id).all()
    
    // Get clinical cases
    const cases = await c.env.DB.prepare(`
      SELECT 
        cc.id, cc.specialty, cc.complexity, cc.title, cc.patient_profile, cc.presentation, 
        cc.anamnesis, cc.questions, cc.red_flags, cc.diagnosis, cc.management, cc.prescription
      FROM evaluation_template_cases etc
      JOIN clinical_cases cc ON etc.case_id = cc.id
      WHERE etc.template_id = ?
      ORDER BY etc.order_index
    `).bind(template_id).all()
    
    // Helper function to safely parse JSON or return as-is if string
    const safeParse = (value: any) => {
      if (!value) return null
      if (typeof value === 'object') return value
      try {
        return JSON.parse(value as string)
      } catch {
        return value // Return as-is if not valid JSON (plain string)
      }
    }
    
    return c.json({
      success: true,
      evaluation: {
        id: `eval-session-${Date.now()}`,
        template_id,
        name: template.name,
        description: template.description,
        duration_minutes: template.duration_minutes,
        passing_score: template.passing_score,
        qcms: qcms.results.map(q => ({
          ...q,
          options: JSON.parse(q.options as string)
        })),
        cases: cases.results.map(c => ({
          ...c,
          patient_profile: safeParse(c.patient_profile),
          presentation: c.presentation,
          anamnesis: safeParse(c.anamnesis),
          questions: safeParse(c.questions)
        }))
      }
    })
  } catch (error: any) {
    console.error('Start Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to start evaluation' }, 500)
  }
})

/**
 * POST /api/evaluations/submit
 * Soumettre les réponses d'une évaluation
 */
evaluations.post('/submit', async (c) => {
  try {
    const { template_id, answers, duration_seconds } = await c.req.json()
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const token = authHeader.substring(7)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const doctorId = payload.doctor_id
    
    // Get template QCMs and cases
    const qcms = await c.env.DB.prepare(`
      SELECT gq.id, gq.correct_answer
      FROM evaluation_template_qcm etq
      JOIN generated_qcm gq ON etq.qcm_id = gq.id
      WHERE etq.template_id = ?
      ORDER BY etq.order_index
    `).bind(template_id).all()
    
    const cases = await c.env.DB.prepare(`
      SELECT cc.id, cc.questions
      FROM evaluation_template_cases etc
      JOIN clinical_cases cc ON etc.case_id = cc.id
      WHERE etc.template_id = ?
      ORDER BY etc.order_index
    `).bind(template_id).all()
    
    // Calculate QCM score
    let qcmCorrect = 0
    let qcmTotal = qcms.results.length
    
    for (const qcm of qcms.results) {
      const userAnswer = answers[`qcm_${qcm.id}`]
      if (userAnswer === qcm.correct_answer) {
        qcmCorrect++
      }
    }
    
    // Calculate Case score
    // For now, give full points if user attempted the case (selected any answer)
    // TODO: Implement proper clinical case evaluation logic
    let caseCorrect = 0
    let caseTotal = 0
    
    for (const clinicalCase of cases.results) {
      const questions = JSON.parse(clinicalCase.questions as string)
      for (let i = 0; i < questions.length; i++) {
        caseTotal++
        const userAnswer = answers[`case_${clinicalCase.id}_q${i}`]
        // Simple check: if user provided any answer, consider it correct for now
        // In production, implement AI-based evaluation or keyword matching
        if (userAnswer) {
          caseCorrect++
        }
      }
    }
    
    // Calculate scores (%)
    const qcmScore = qcmTotal > 0 ? Math.round((qcmCorrect / qcmTotal) * 100) : 0
    const caseScore = caseTotal > 0 ? Math.round((caseCorrect / caseTotal) * 100) : 0
    
    // Calculate T-MCQ (weighted average: QCM 40%, Cases 60%)
    const tmcqScore = Math.round((qcmScore * 0.4) + (caseScore * 0.6))
    
    // Determine status
    let status = 'formation_requise'
    if (tmcqScore >= 75) status = 'apte'
    else if (tmcqScore >= 60) status = 'supervision_requise'
    
    // Save to database
    const resultId = `eval-result-${Date.now()}`
    
    await c.env.DB.prepare(`
      INSERT INTO doctors_evaluations (id, doctor_id, qcm_score, clinical_cases_score, tmcq_total, status, evaluation_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(resultId, doctorId, qcmScore, caseScore, tmcqScore, status).run()
    
    // Update doctor's latest scores
    await c.env.DB.prepare(`
      UPDATE doctors 
      SET tmcq_total = ?,
          evaluation_status = ?,
          last_evaluation_date = datetime('now')
      WHERE id = ?
    `).bind(tmcqScore, status, doctorId).run()
    
    return c.json({
      success: true,
      result: {
        id: resultId,
        template_id,
        doctor_id: doctorId,
        tmcq_score: tmcqScore,
        qcm_score: qcmScore,
        case_score: caseScore,
        qcm_correct: qcmCorrect,
        qcm_total: qcmTotal,
        case_correct: caseCorrect,
        case_total: caseTotal,
        status: status,
        created_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Submit Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to submit evaluation' }, 500)
  }
})

/**
 * GET /api/evaluations/results/:id
 * Récupérer les résultats d'une évaluation
 */
evaluations.get('/results/:id', async (c) => {
  try {
    const resultId = c.req.param('id')
    
    // Get evaluation result
    const result = await c.env.DB.prepare(`
      SELECT * FROM doctors_evaluations WHERE id = ?
    `).bind(resultId).first()
    
    if (!result) {
      return c.json({ error: 'Results not found' }, 404)
    }
    
    return c.json({
      success: true,
      id: result.id,
      evaluation_name: 'Évaluation Médicale',
      tmcq_score: result.tmcq_total || 0,
      qcm_score: result.qcm_score || 0,
      case_score: result.clinical_cases_score || 0,
      qcm_correct: 0,
      qcm_total: 0,
      case_correct: 0,
      case_total: 0,
      status: result.status,
      created_at: result.created_at,
      qcm_details: [],
      case_details: []
    })
  } catch (error: any) {
    console.error('Get Results Error:', error)
    return c.json({ error: error.message || 'Failed to get results' }, 500)
  }
})

export default evaluations
