// Tibok Medical Evaluation - Evaluation Sessions Routes

import { Hono } from 'hono'
import type { Bindings } from '../types/medical'
import { authMiddleware, getCurrentUser } from '../lib/auth'
import { calculateTMCQ } from '../lib/scoring'

const sessions = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware
sessions.use('/*', authMiddleware)

/**
 * POST /api/sessions/start
 * Start a new evaluation session
 */
sessions.post('/start', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { session_type } = await c.req.json()

    if (!session_type || !['qcm', 'clinical_cases', 'full'].includes(session_type)) {
      return c.json({ error: 'Invalid session_type. Must be: qcm, clinical_cases, or full' }, 400)
    }

    // Check if there's already an active session
    const existing = await c.env.DB.prepare(`
      SELECT id FROM evaluation_sessions
      WHERE doctor_id = ? AND status = 'in_progress'
    `).bind(user.doctor_id).first()

    if (existing) {
      return c.json({ error: 'You already have an active session. Complete it first.' }, 409)
    }

    // Create new session
    const sessionId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO evaluation_sessions (id, doctor_id, session_type, status, started_at, created_at)
      VALUES (?, ?, ?, 'in_progress', datetime('now'), datetime('now'))
    `).bind(sessionId, user.doctor_id, session_type).run()

    // Get test content based on session type
    let qcms = []
    let cases = []

    if (session_type === 'qcm' || session_type === 'full') {
      // Get 50 random QCM
      const qcmResult = await c.env.DB.prepare(`
        SELECT id, topic, category, difficulty, question, options
        FROM generated_qcm
        ORDER BY RANDOM()
        LIMIT 50
      `).all()
      qcms = qcmResult.results.map(q => ({
        ...q,
        options: JSON.parse(q.options as string)
      }))
    }

    if (session_type === 'clinical_cases' || session_type === 'full') {
      // Get 5 random clinical cases
      const casesResult = await c.env.DB.prepare(`
        SELECT id, specialty, complexity, title, patient_profile, presentation, anamnesis, questions
        FROM clinical_cases
        ORDER BY RANDOM()
        LIMIT 5
      `).all()
      cases = casesResult.results.map(ca => ({
        ...ca,
        patient_profile: JSON.parse(ca.patient_profile as string),
        anamnesis: JSON.parse(ca.anamnesis as string),
        questions: JSON.parse(ca.questions as string)
      }))
    }

    return c.json({
      success: true,
      session: {
        id: sessionId,
        session_type,
        status: 'in_progress',
        started_at: new Date().toISOString()
      },
      content: {
        qcms,
        clinical_cases: cases
      }
    })
  } catch (error: any) {
    console.error('Start Session Error:', error)
    return c.json({ error: error.message || 'Failed to start session' }, 500)
  }
})

/**
 * POST /api/sessions/:sessionId/submit
 * Submit answers and complete session
 */
sessions.post('/:sessionId/submit', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const sessionId = c.req.param('sessionId')
    const { qcm_answers, case_answers } = await c.req.json()

    // Get session
    const session = await c.env.DB.prepare(`
      SELECT * FROM evaluation_sessions WHERE id = ? AND doctor_id = ?
    `).bind(sessionId, user.doctor_id).first()

    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    if (session.status !== 'in_progress') {
      return c.json({ error: 'Session is not in progress' }, 400)
    }

    let qcmScore = 0
    let casesScore = 0

    // Evaluate QCM answers
    if (qcm_answers && Array.isArray(qcm_answers)) {
      let correctCount = 0
      
      for (const answer of qcm_answers) {
        const qcm = await c.env.DB.prepare('SELECT correct_answer FROM generated_qcm WHERE id = ?')
          .bind(answer.qcm_id)
          .first()
        
        const isCorrect = qcm && answer.selected_answer === qcm.correct_answer
        
        // Record attempt
        await c.env.DB.prepare(`
          INSERT INTO doctor_qcm_attempts (id, doctor_id, qcm_id, selected_answer, is_correct, time_taken_seconds, created_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `).bind(
          crypto.randomUUID(),
          user.doctor_id,
          answer.qcm_id,
          answer.selected_answer,
          isCorrect ? 1 : 0,
          answer.time_taken_seconds || null
        ).run()
        
        if (isCorrect) correctCount++
      }
      
      qcmScore = Math.round((correctCount / qcm_answers.length) * 100)
    }

    // Evaluate clinical case answers
    if (case_answers && Array.isArray(case_answers)) {
      let totalScore = 0
      
      for (const caseAttempt of case_answers) {
        const clinicalCase = await c.env.DB.prepare('SELECT questions FROM clinical_cases WHERE id = ?')
          .bind(caseAttempt.case_id)
          .first()
        
        if (!clinicalCase) continue
        
        const questions = JSON.parse(clinicalCase.questions as string)
        let correctCount = 0
        
        for (let i = 0; i < questions.length; i++) {
          if (caseAttempt.answers[i] === questions[i].correct) {
            correctCount++
          }
        }
        
        const score = Math.round((correctCount / questions.length) * 100)
        totalScore += score
        
        // Record attempt
        await c.env.DB.prepare(`
          INSERT INTO doctor_case_attempts (id, doctor_id, case_id, answers, score, completed_at, created_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
          crypto.randomUUID(),
          user.doctor_id,
          caseAttempt.case_id,
          JSON.stringify(caseAttempt.answers),
          score
        ).run()
      }
      
      casesScore = case_answers.length > 0 ? Math.round(totalScore / case_answers.length) : 0
    }

    // Calculate total score based on session type
    let totalScore = 0
    if (session.session_type === 'qcm') {
      totalScore = qcmScore
    } else if (session.session_type === 'clinical_cases') {
      totalScore = casesScore
    } else if (session.session_type === 'full') {
      totalScore = Math.round((qcmScore + casesScore) / 2)
    }

    // Update session
    await c.env.DB.prepare(`
      UPDATE evaluation_sessions
      SET status = 'completed',
          completed_at = datetime('now'),
          qcm_score = ?,
          cases_score = ?,
          total_score = ?
      WHERE id = ?
    `).bind(qcmScore, casesScore, totalScore, sessionId).run()

    // If full evaluation, create T-MCQ record
    if (session.session_type === 'full') {
      const tmcq = calculateTMCQ(qcmScore, casesScore, totalScore)
      
      const evaluationId = crypto.randomUUID()
      await c.env.DB.prepare(`
        INSERT INTO doctors_evaluations (id, doctor_id, qcm_score, clinical_cases_score, ai_audit_score, tmcq_total, status, evaluation_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        evaluationId,
        user.doctor_id,
        qcmScore,
        casesScore,
        totalScore,
        tmcq.total,
        tmcq.status
      ).run()
    }

    return c.json({
      success: true,
      session_id: sessionId,
      scores: {
        qcm_score: qcmScore,
        cases_score: casesScore,
        total_score: totalScore
      },
      message: 'Session completed successfully'
    })
  } catch (error: any) {
    console.error('Submit Session Error:', error)
    return c.json({ error: error.message || 'Failed to submit session' }, 500)
  }
})

/**
 * GET /api/sessions/me
 * Get current doctor's sessions
 */
sessions.get('/me', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const result = await c.env.DB.prepare(`
      SELECT *
      FROM evaluation_sessions
      WHERE doctor_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(user.doctor_id).all()

    return c.json({
      success: true,
      sessions: result.results
    })
  } catch (error: any) {
    console.error('Get Sessions Error:', error)
    return c.json({ error: error.message || 'Failed to get sessions' }, 500)
  }
})

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
sessions.get('/:sessionId', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const sessionId = c.req.param('sessionId')

    const session = await c.env.DB.prepare(`
      SELECT * FROM evaluation_sessions WHERE id = ? AND doctor_id = ?
    `).bind(sessionId, user.doctor_id).first()

    if (!session) {
      return c.json({ error: 'Session not found' }, 404)
    }

    return c.json({
      success: true,
      session
    })
  } catch (error: any) {
    console.error('Get Session Error:', error)
    return c.json({ error: error.message || 'Failed to get session' }, 500)
  }
})

/**
 * POST /api/sessions/:sessionId/cancel
 * Cancel an active session
 */
sessions.post('/:sessionId/cancel', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const sessionId = c.req.param('sessionId')

    await c.env.DB.prepare(`
      UPDATE evaluation_sessions
      SET status = 'cancelled', completed_at = datetime('now')
      WHERE id = ? AND doctor_id = ? AND status = 'in_progress'
    `).bind(sessionId, user.doctor_id).run()

    return c.json({
      success: true,
      message: 'Session cancelled'
    })
  } catch (error: any) {
    console.error('Cancel Session Error:', error)
    return c.json({ error: error.message || 'Failed to cancel session' }, 500)
  }
})

export default sessions
