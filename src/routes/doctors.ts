// Tibok Medical Evaluation - Doctors Management Routes

import { Hono } from 'hono'
import type { Bindings } from '../types/medical'
import { authMiddleware, adminMiddleware, getCurrentUser, hashPassword } from '../lib/auth'

const doctors = new Hono<{ Bindings: Bindings }>()

// Apply auth middleware to all routes
doctors.use('/*', authMiddleware)

/**
 * GET /api/doctors/me
 * Get current doctor profile
 */
doctors.get('/me', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const doctor = await c.env.DB.prepare(`
      SELECT id, email, name, specialty, license_number, role, status, last_login, created_at
      FROM doctors
      WHERE id = ?
    `).bind(user.doctor_id).first()

    if (!doctor) {
      return c.json({ error: 'Doctor not found' }, 404)
    }

    return c.json({
      success: true,
      doctor
    })
  } catch (error: any) {
    console.error('Get Me Error:', error)
    return c.json({ error: error.message || 'Failed to get profile' }, 500)
  }
})

/**
 * PUT /api/doctors/me
 * Update current doctor profile
 */
doctors.put('/me', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const { name, specialty, license_number } = await c.req.json()

    await c.env.DB.prepare(`
      UPDATE doctors
      SET name = COALESCE(?, name),
          specialty = COALESCE(?, specialty),
          license_number = COALESCE(?, license_number),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(name || null, specialty || null, license_number || null, user.doctor_id).run()

    return c.json({
      success: true,
      message: 'Profile updated'
    })
  } catch (error: any) {
    console.error('Update Profile Error:', error)
    return c.json({ error: error.message || 'Failed to update profile' }, 500)
  }
})

/**
 * GET /api/doctors/me/stats
 * Get current doctor statistics
 */
doctors.get('/me/stats', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // Latest evaluation
    const latestEval = await c.env.DB.prepare(`
      SELECT tmcq_total, status, evaluation_date
      FROM doctors_evaluations
      WHERE doctor_id = ?
      ORDER BY evaluation_date DESC
      LIMIT 1
    `).bind(user.doctor_id).first()

    // QCM stats
    const qcmStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        ROUND(AVG(CASE WHEN is_correct = 1 THEN 100.0 ELSE 0.0 END), 2) as success_rate
      FROM doctor_qcm_attempts
      WHERE doctor_id = ?
    `).bind(user.doctor_id).first()

    // Clinical cases stats
    const casesStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_attempts,
        ROUND(AVG(score), 2) as average_score
      FROM doctor_case_attempts
      WHERE doctor_id = ?
    `).bind(user.doctor_id).first()

    // Unresolved alerts
    const alertsCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM alerts_doctors
      WHERE doctor_id = ? AND resolved = 0
    `).bind(user.doctor_id).first()

    return c.json({
      success: true,
      stats: {
        latest_evaluation: latestEval,
        qcm: qcmStats,
        clinical_cases: casesStats,
        unresolved_alerts: alertsCount?.count || 0
      }
    })
  } catch (error: any) {
    console.error('Get Stats Error:', error)
    return c.json({ error: error.message || 'Failed to get stats' }, 500)
  }
})

/**
 * GET /api/doctors/me/evaluations
 * Get current doctor evaluation history
 */
doctors.get('/me/evaluations', async (c) => {
  try {
    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const evaluations = await c.env.DB.prepare(`
      SELECT *
      FROM doctors_evaluations
      WHERE doctor_id = ?
      ORDER BY evaluation_date DESC
      LIMIT 10
    `).bind(user.doctor_id).all()

    return c.json({
      success: true,
      evaluations: evaluations.results
    })
  } catch (error: any) {
    console.error('Get Evaluations Error:', error)
    return c.json({ error: error.message || 'Failed to get evaluations' }, 500)
  }
})

/**
 * GET /api/doctors (Admin only)
 * List all doctors
 */
doctors.get('/', adminMiddleware, async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    const result = await c.env.DB.prepare(`
      SELECT 
        d.id, d.email, d.name, d.specialty, d.license_number, d.role, d.status, d.last_login, d.created_at,
        de.tmcq_total,
        de.status as evaluation_status
      FROM doctors d
      LEFT JOIN (
        SELECT doctor_id, tmcq_total, status
        FROM doctors_evaluations
        WHERE id IN (
          SELECT id FROM doctors_evaluations de2
          WHERE de2.doctor_id = doctors_evaluations.doctor_id
          ORDER BY de2.evaluation_date DESC
          LIMIT 1
        )
      ) de ON d.id = de.doctor_id
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    return c.json({
      success: true,
      count: result.results.length,
      doctors: result.results
    })
  } catch (error: any) {
    console.error('List Doctors Error:', error)
    return c.json({ error: error.message || 'Failed to list doctors' }, 500)
  }
})

/**
 * POST /api/doctors (Admin only)
 * Create a new doctor account
 */
doctors.post('/', adminMiddleware, async (c) => {
  try {
    const { email, password, name, specialty, license_number, role } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Check if exists
    const existing = await c.env.DB.prepare('SELECT id FROM doctors WHERE email = ?')
      .bind(email)
      .first()

    if (existing) {
      return c.json({ error: 'Email already exists' }, 409)
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create doctor
    const doctorId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctors (id, email, password_hash, name, specialty, license_number, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).bind(
      doctorId,
      email.toLowerCase(),
      password_hash,
      name,
      specialty || null,
      license_number || null,
      role || 'doctor'
    ).run()

    return c.json({
      success: true,
      message: 'Doctor created',
      doctor_id: doctorId
    }, 201)
  } catch (error: any) {
    console.error('Create Doctor Error:', error)
    return c.json({ error: error.message || 'Failed to create doctor' }, 500)
  }
})

/**
 * PUT /api/doctors/:id (Admin only)
 * Update doctor account
 */
doctors.put('/:id', adminMiddleware, async (c) => {
  try {
    const doctorId = c.req.param('id')
    const { name, specialty, license_number, status } = await c.req.json()

    await c.env.DB.prepare(`
      UPDATE doctors
      SET name = COALESCE(?, name),
          specialty = COALESCE(?, specialty),
          license_number = COALESCE(?, license_number),
          status = COALESCE(?, status),
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(name || null, specialty || null, license_number || null, status || null, doctorId).run()

    return c.json({
      success: true,
      message: 'Doctor updated'
    })
  } catch (error: any) {
    console.error('Update Doctor Error:', error)
    return c.json({ error: error.message || 'Failed to update doctor' }, 500)
  }
})

/**
 * DELETE /api/doctors/:id (Admin only)
 * Delete doctor account
 */
doctors.delete('/:id', adminMiddleware, async (c) => {
  try {
    const doctorId = c.req.param('id')

    await c.env.DB.prepare('DELETE FROM doctors WHERE id = ?')
      .bind(doctorId)
      .run()

    return c.json({
      success: true,
      message: 'Doctor deleted'
    })
  } catch (error: any) {
    console.error('Delete Doctor Error:', error)
    return c.json({ error: error.message || 'Failed to delete doctor' }, 500)
  }
})

export default doctors
