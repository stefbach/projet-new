// Tibok Medical Evaluation - Admin Routes
// Dashboard et gestion administrative

import { Hono } from 'hono'
import type { Bindings } from '../types/medical'
import { calculateTMCQ } from '../lib/scoring'

const admin = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/admin/doctors
 * Liste tous les médecins avec leurs scores
 */
admin.get('/doctors', async (c) => {
  try {
    const status = c.req.query('status') // apte, supervision, formation_requise
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT 
        d.*,
        de.tmcq_total,
        de.status as evaluation_status,
        de.evaluation_date,
        (SELECT COUNT(*) FROM alerts_doctors WHERE doctor_id = d.id AND resolved = 0) as unresolved_alerts
      FROM doctors d
      LEFT JOIN (
        SELECT doctor_id, tmcq_total, status, evaluation_date
        FROM doctors_evaluations
        WHERE id IN (
          SELECT id FROM doctors_evaluations de2
          WHERE de2.doctor_id = doctors_evaluations.doctor_id
          ORDER BY de2.evaluation_date DESC
          LIMIT 1
        )
      ) de ON d.id = de.doctor_id
    `

    const params: any[] = []

    if (status) {
      query += ' WHERE de.status = ?'
      params.push(status)
    }

    query += ' ORDER BY d.name LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      count: result.results.length,
      doctors: result.results
    })
  } catch (error: any) {
    console.error('Admin Doctors Error:', error)
    return c.json({ error: error.message || 'Failed to fetch doctors' }, 500)
  }
})

/**
 * GET /api/admin/doctor/:doctorId
 * Détails complets d'un médecin
 */
admin.get('/doctor/:doctorId', async (c) => {
  try {
    const doctorId = c.req.param('doctorId')

    // Infos médecin
    const doctor = await c.env.DB.prepare('SELECT * FROM doctors WHERE id = ?')
      .bind(doctorId)
      .first()

    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404)
    }

    // Historique des évaluations
    const evaluations = await c.env.DB.prepare(`
      SELECT * FROM doctors_evaluations
      WHERE doctor_id = ?
      ORDER BY evaluation_date DESC
      LIMIT 10
    `).bind(doctorId).all()

    // Derniers audits
    const audits = await c.env.DB.prepare(`
      SELECT * FROM consultations_audit
      WHERE doctor_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(doctorId).all()

    // Alertes non résolues
    const alerts = await c.env.DB.prepare(`
      SELECT * FROM alerts_doctors
      WHERE doctor_id = ? AND resolved = 0
      ORDER BY created_at DESC
    `).bind(doctorId).all()

    return c.json({
      success: true,
      doctor,
      evaluations: evaluations.results,
      recent_audits: audits.results.map(audit => ({
        ...audit,
        ai_output: JSON.parse(audit.ai_output as string)
      })),
      unresolved_alerts: alerts.results
    })
  } catch (error: any) {
    console.error('Admin Doctor Detail Error:', error)
    return c.json({ error: error.message || 'Failed to fetch doctor details' }, 500)
  }
})

/**
 * GET /api/admin/audits
 * Liste des audits de consultation
 */
admin.get('/audits', async (c) => {
  try {
    const flagged = c.req.query('flagged') // 1 ou 0
    const severity = c.req.query('severity') // low, medium, high
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    let query = `
      SELECT 
        ca.*,
        d.name as doctor_name,
        d.email as doctor_email
      FROM consultations_audit ca
      JOIN doctors d ON ca.doctor_id = d.id
    `

    const conditions: string[] = []
    const params: any[] = []

    if (flagged !== undefined) {
      conditions.push('ca.flagged = ?')
      params.push(parseInt(flagged))
    }

    if (severity) {
      conditions.push('ca.severity = ?')
      params.push(severity)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY ca.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const result = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      count: result.results.length,
      audits: result.results.map(audit => ({
        ...audit,
        ai_output: JSON.parse(audit.ai_output as string)
      }))
    })
  } catch (error: any) {
    console.error('Admin Audits Error:', error)
    return c.json({ error: error.message || 'Failed to fetch audits' }, 500)
  }
})

/**
 * GET /api/admin/alerts
 * Liste des alertes
 */
admin.get('/alerts', async (c) => {
  try {
    const resolved = c.req.query('resolved') // 1 ou 0
    const severity = c.req.query('severity')
    const limit = parseInt(c.req.query('limit') || '50')

    let query = `
      SELECT 
        a.*,
        d.name as doctor_name,
        d.email as doctor_email
      FROM alerts_doctors a
      JOIN doctors d ON a.doctor_id = d.id
    `

    const conditions: string[] = []
    const params: any[] = []

    if (resolved !== undefined) {
      conditions.push('a.resolved = ?')
      params.push(parseInt(resolved))
    }

    if (severity) {
      conditions.push('a.severity = ?')
      params.push(severity)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY a.created_at DESC LIMIT ?'
    params.push(limit)

    const result = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({
      success: true,
      count: result.results.length,
      alerts: result.results
    })
  } catch (error: any) {
    console.error('Admin Alerts Error:', error)
    return c.json({ error: error.message || 'Failed to fetch alerts' }, 500)
  }
})

/**
 * PUT /api/admin/alert/:alertId/resolve
 * Marquer une alerte comme résolue
 */
admin.put('/alert/:alertId/resolve', async (c) => {
  try {
    const alertId = c.req.param('alertId')

    await c.env.DB.prepare(`
      UPDATE alerts_doctors
      SET resolved = 1, resolved_at = datetime('now')
      WHERE id = ?
    `).bind(alertId).run()

    return c.json({
      success: true,
      message: 'Alert resolved'
    })
  } catch (error: any) {
    console.error('Resolve Alert Error:', error)
    return c.json({ error: error.message || 'Failed to resolve alert' }, 500)
  }
})

/**
 * GET /api/admin/stats
 * Statistiques globales du système
 */
admin.get('/stats', async (c) => {
  try {
    // Total médecins
    const totalDoctors = await c.env.DB.prepare('SELECT COUNT(*) as count FROM doctors').first()

    // Distribution des statuts
    const statusDistribution = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM doctors_evaluations
      WHERE id IN (
        SELECT id FROM doctors_evaluations de2
        WHERE de2.doctor_id = doctors_evaluations.doctor_id
        ORDER BY de2.evaluation_date DESC
        LIMIT 1
      )
      GROUP BY status
    `).all()

    // Alertes non résolues
    const unresolvedAlerts = await c.env.DB.prepare(`
      SELECT severity, COUNT(*) as count
      FROM alerts_doctors
      WHERE resolved = 0
      GROUP BY severity
    `).all()

    // Audits flagged
    const flaggedAudits = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM consultations_audit
      WHERE flagged = 1
    `).first()

    // Score T-MCQ moyen
    const avgTMCQ = await c.env.DB.prepare(`
      SELECT ROUND(AVG(tmcq_total), 2) as avg_score
      FROM doctors_evaluations
      WHERE evaluation_date >= datetime('now', '-30 days')
    `).first()

    // Total QCM et cas cliniques
    const contentStats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM generated_qcm) as total_qcm,
        (SELECT COUNT(*) FROM clinical_cases) as total_cases
    `).first()

    return c.json({
      success: true,
      stats: {
        total_doctors: totalDoctors?.count || 0,
        status_distribution: statusDistribution.results,
        unresolved_alerts: unresolvedAlerts.results,
        flagged_audits: flaggedAudits?.count || 0,
        average_tmcq_30days: avgTMCQ?.avg_score || 0,
        content: contentStats
      }
    })
  } catch (error: any) {
    console.error('Admin Stats Error:', error)
    return c.json({ error: error.message || 'Failed to fetch stats' }, 500)
  }
})

/**
 * POST /api/admin/doctor/:doctorId/evaluate
 * Créer une évaluation manuelle T-MCQ
 */
admin.post('/doctor/:doctorId/evaluate', async (c) => {
  try {
    const doctorId = c.req.param('doctorId')
    const { qcm_score, clinical_cases_score, ai_audit_score } = await c.req.json()

    // Calcul T-MCQ
    const tmcq = calculateTMCQ(qcm_score, clinical_cases_score, ai_audit_score)

    // Insertion
    const evaluationId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctors_evaluations (id, doctor_id, qcm_score, clinical_cases_score, ai_audit_score, tmcq_total, status, evaluation_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      evaluationId,
      doctorId,
      qcm_score,
      clinical_cases_score,
      ai_audit_score,
      tmcq.total,
      tmcq.status
    ).run()

    return c.json({
      success: true,
      evaluation_id: evaluationId,
      tmcq
    })
  } catch (error: any) {
    console.error('Create Evaluation Error:', error)
    return c.json({ error: error.message || 'Failed to create evaluation' }, 500)
  }
})

export default admin
