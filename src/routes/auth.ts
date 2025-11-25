// Tibok Medical Evaluation - Authentication Routes

import { Hono } from 'hono'
import type { Bindings } from '../types/medical'
import { generateToken, hashPassword, verifyPassword } from '../lib/auth'

const auth = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/auth/register
 * Register a new doctor account
 */
auth.post('/register', async (c) => {
  try {
    const { email, password, name, specialty, license_number } = await c.req.json()

    // Validation
    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields: email, password, name' }, 400)
    }

    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400)
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare('SELECT id FROM doctors WHERE email = ?')
      .bind(email)
      .first()

    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create doctor account
    const doctorId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctors (id, email, password_hash, name, specialty, license_number, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'doctor', 'active', datetime('now'), datetime('now'))
    `).bind(
      doctorId,
      email.toLowerCase(),
      password_hash,
      name,
      specialty || null,
      license_number || null
    ).run()

    // Generate JWT token
    const token = await generateToken({
      doctor_id: doctorId,
      email: email.toLowerCase(),
      role: 'doctor'
    })

    return c.json({
      success: true,
      message: 'Account created successfully',
      token,
      doctor: {
        id: doctorId,
        email: email.toLowerCase(),
        name,
        specialty,
        role: 'doctor'
      }
    }, 201)
  } catch (error: any) {
    console.error('Registration Error:', error)
    return c.json({ error: error.message || 'Registration failed' }, 500)
  }
})

/**
 * POST /api/auth/login
 * Login with email and password
 */
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400)
    }

    // Find doctor
    const doctor = await c.env.DB.prepare(`
      SELECT id, email, password_hash, name, specialty, license_number, role, status
      FROM doctors
      WHERE email = ?
    `).bind(email.toLowerCase()).first()

    if (!doctor) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Check if account is active
    if (doctor.status !== 'active') {
      return c.json({ error: 'Account is suspended. Contact administrator.' }, 403)
    }

    // Verify password
    const isValid = await verifyPassword(password, doctor.password_hash as string)
    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    // Update last login
    await c.env.DB.prepare('UPDATE doctors SET last_login = datetime("now") WHERE id = ?')
      .bind(doctor.id)
      .run()

    // Generate JWT token
    const token = await generateToken({
      doctor_id: doctor.id as string,
      email: doctor.email as string,
      role: doctor.role as 'admin' | 'doctor'
    })

    return c.json({
      success: true,
      token,
      doctor: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        specialty: doctor.specialty,
        license_number: doctor.license_number,
        role: doctor.role
      }
    })
  } catch (error: any) {
    console.error('Login Error:', error)
    return c.json({ error: error.message || 'Login failed' }, 500)
  }
})

/**
 * POST /api/auth/create-admin
 * Create admin account (temporary endpoint - should be secured)
 */
auth.post('/create-admin', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Check if admin already exists
    const existing = await c.env.DB.prepare('SELECT id FROM doctors WHERE role = "admin" AND email = ?')
      .bind(email)
      .first()

    if (existing) {
      return c.json({ error: 'Admin already exists' }, 409)
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create admin account
    const adminId = crypto.randomUUID()
    await c.env.DB.prepare(`
      INSERT INTO doctors (id, email, password_hash, name, specialty, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'Administration', 'admin', 'active', datetime('now'), datetime('now'))
    `).bind(
      adminId,
      email.toLowerCase(),
      password_hash,
      name
    ).run()

    // Generate token
    const token = await generateToken({
      doctor_id: adminId,
      email: email.toLowerCase(),
      role: 'admin'
    })

    return c.json({
      success: true,
      message: 'Admin account created',
      token,
      admin: {
        id: adminId,
        email: email.toLowerCase(),
        name,
        role: 'admin'
      }
    }, 201)
  } catch (error: any) {
    console.error('Create Admin Error:', error)
    return c.json({ error: error.message || 'Failed to create admin' }, 500)
  }
})

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7)
    const { verifyToken } = await import('../lib/auth')
    const payload = await verifyToken(token)

    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    // Get doctor info
    const doctor = await c.env.DB.prepare(`
      SELECT id, email, name, specialty, license_number, role, status, last_login, created_at
      FROM doctors
      WHERE id = ?
    `).bind(payload.doctor_id).first()

    if (!doctor) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      success: true,
      doctor
    })
  } catch (error: any) {
    console.error('Get Me Error:', error)
    return c.json({ error: error.message || 'Failed to get user info' }, 500)
  }
})

export default auth
