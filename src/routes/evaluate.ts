// Tibok Medical Evaluation - Evaluation Routes
// Évaluation IA des consultations médicales

import { Hono } from 'hono'
import type { Bindings, EvaluateConsultationRequest } from '../types/medical'
import { OpenAIService } from '../lib/openai'
import { calculateAIGlobalScore, shouldCreateAlert, generateAlertMessage } from '../lib/scoring'

const evaluate = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/evaluate/consultation
 * Évalue une téléconsultation via IA
 */
evaluate.post('/consultation', async (c) => {
  try {
    const { doctor_id, consultation_id, transcript, patient_age, patient_sex, chief_complaint }: EvaluateConsultationRequest = await c.req.json()

    // Validation
    if (!doctor_id || !transcript) {
      return c.json({ error: 'Missing required fields: doctor_id, transcript' }, 400)
    }

    // Évaluation via OpenAI
    const openai = new OpenAIService(c.env.OPENAI_API_KEY)
    const aiOutput = await openai.evaluateConsultation(transcript, {
      age: patient_age,
      sex: patient_sex,
      chief_complaint
    })

    // Calcul du score global
    const globalScore = calculateAIGlobalScore(aiOutput)

    // Insertion dans consultations_audit
    const auditId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO consultations_audit (
        id, doctor_id, consultation_id, patient_age, patient_sex, chief_complaint,
        raw_transcript, ai_output, anamnese_score, diagnostic_score, prescription_score,
        red_flags_score, communication_score, global_score, flagged, severity, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      auditId,
      doctor_id,
      consultation_id || null,
      patient_age || null,
      patient_sex || null,
      chief_complaint || null,
      transcript,
      JSON.stringify(aiOutput),
      aiOutput.anamnese_score,
      aiOutput.diagnostic_score,
      aiOutput.prescription_score,
      aiOutput.red_flags_score || 0,
      aiOutput.communication_score,
      globalScore,
      shouldCreateAlert(aiOutput) ? 1 : 0,
      aiOutput.severity
    ).run()

    // Création d'alerte si nécessaire
    if (shouldCreateAlert(aiOutput)) {
      const alert = generateAlertMessage(aiOutput)
      const alertId = crypto.randomUUID()
      
      await c.env.DB.prepare(`
        INSERT INTO alerts_doctors (id, doctor_id, alert_type, message, severity, resolved, created_at)
        VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
      `).bind(
        alertId,
        doctor_id,
        alert.type,
        alert.message,
        alert.severity
      ).run()
    }

    return c.json({
      success: true,
      audit_id: auditId,
      ai_output: {
        ...aiOutput,
        global_score: globalScore
      },
      alert_created: shouldCreateAlert(aiOutput)
    })
  } catch (error: any) {
    console.error('Consultation Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to evaluate consultation' }, 500)
  }
})

/**
 * POST /api/evaluate/qcm
 * Enregistre une tentative de QCM
 */
evaluate.post('/qcm', async (c) => {
  try {
    const { doctor_id, qcm_id, selected_answer, time_taken_seconds } = await c.req.json()

    if (!doctor_id || !qcm_id || !selected_answer) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Récupérer le QCM
    const qcm = await c.env.DB.prepare('SELECT * FROM generated_qcm WHERE id = ?')
      .bind(qcm_id)
      .first()

    if (!qcm) {
      return c.json({ error: 'QCM not found' }, 404)
    }

    const isCorrect = selected_answer === qcm.correct_answer

    // Enregistrer la tentative
    const attemptId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctor_qcm_attempts (id, doctor_id, qcm_id, selected_answer, is_correct, time_taken_seconds, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      attemptId,
      doctor_id,
      qcm_id,
      selected_answer,
      isCorrect ? 1 : 0,
      time_taken_seconds || null
    ).run()

    // Incrémenter used_count
    await c.env.DB.prepare('UPDATE generated_qcm SET used_count = used_count + 1 WHERE id = ?')
      .bind(qcm_id)
      .run()

    return c.json({
      success: true,
      attempt_id: attemptId,
      is_correct: isCorrect,
      correct_answer: qcm.correct_answer,
      justification: qcm.justification
    })
  } catch (error: any) {
    console.error('QCM Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to evaluate QCM' }, 500)
  }
})

/**
 * POST /api/evaluate/clinical-case
 * Enregistre une tentative de cas clinique
 */
evaluate.post('/clinical-case', async (c) => {
  try {
    const { doctor_id, case_id, answers } = await c.req.json()

    if (!doctor_id || !case_id || !answers) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Récupérer le cas clinique
    const clinicalCase = await c.env.DB.prepare('SELECT * FROM clinical_cases WHERE id = ?')
      .bind(case_id)
      .first()

    if (!clinicalCase) {
      return c.json({ error: 'Clinical case not found' }, 404)
    }

    const questions = JSON.parse(clinicalCase.questions as string)

    // Calculer le score
    let correctCount = 0
    const feedback = questions.map((q: any, index: number) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === q.correct
      if (isCorrect) correctCount++

      return {
        question_index: index,
        user_answer: userAnswer,
        correct_answer: q.correct,
        is_correct: isCorrect,
        rationale: q.rationale
      }
    })

    const score = Math.round((correctCount / questions.length) * 100)

    // Enregistrer la tentative
    const attemptId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctor_case_attempts (id, doctor_id, case_id, answers, score, feedback, completed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      attemptId,
      doctor_id,
      case_id,
      JSON.stringify(answers),
      score,
      JSON.stringify(feedback)
    ).run()

    // Incrémenter used_count
    await c.env.DB.prepare('UPDATE clinical_cases SET used_count = used_count + 1 WHERE id = ?')
      .bind(case_id)
      .run()

    return c.json({
      success: true,
      attempt_id: attemptId,
      score,
      correct_count: correctCount,
      total_questions: questions.length,
      feedback
    })
  } catch (error: any) {
    console.error('Clinical Case Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to evaluate clinical case' }, 500)
  }
})

/**
 * GET /api/evaluate/doctor/:doctorId/stats
 * Récupère les statistiques d'évaluation d'un médecin
 */
evaluate.get('/doctor/:doctorId/stats', async (c) => {
  try {
    const doctorId = c.req.param('doctorId')

    // Stats QCM
    const qcmStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        ROUND(AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END), 2) as success_rate
      FROM doctor_qcm_attempts
      WHERE doctor_id = ?
    `).bind(doctorId).first()

    // Stats cas cliniques
    const caseStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        ROUND(AVG(score), 2) as average_score
      FROM doctor_case_attempts
      WHERE doctor_id = ?
    `).bind(doctorId).first()

    // Stats audits consultation
    const auditStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_audits,
        ROUND(AVG(global_score), 2) as average_score,
        SUM(CASE WHEN flagged = 1 THEN 1 ELSE 0 END) as flagged_count
      FROM consultations_audit
      WHERE doctor_id = ?
    `).bind(doctorId).first()

    // Alertes non résolues
    const alertsCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as unresolved_alerts
      FROM alerts_doctors
      WHERE doctor_id = ? AND resolved = 0
    `).bind(doctorId).first()

    return c.json({
      success: true,
      doctor_id: doctorId,
      qcm_stats: qcmStats,
      clinical_case_stats: caseStats,
      audit_stats: auditStats,
      unresolved_alerts: alertsCount?.unresolved_alerts || 0
    })
  } catch (error: any) {
    console.error('Doctor Stats Error:', error)
    return c.json({ error: error.message || 'Failed to fetch doctor stats' }, 500)
  }
})

export default evaluate
