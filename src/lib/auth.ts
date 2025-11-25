// Tibok Medical Evaluation - Authentication System

import { createMiddleware } from 'hono/factory'
import type { Bindings } from '../types/medical'

// JWT Secret (should be in environment variable)
const JWT_SECRET = 'tibok-medical-secret-change-in-production'
const JWT_EXPIRY = 7 * 24 * 60 * 60 // 7 days in seconds

// Simple JWT encoding (production should use proper library)
function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

export interface JWTPayload {
  doctor_id: string
  email: string
  role: 'admin' | 'doctor'
  exp: number
  iat: number
}

/**
 * Generate JWT token
 */
export async function generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY
  }
  
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerEncoded = base64urlEncode(JSON.stringify(header))
  const payloadEncoded = base64urlEncode(JSON.stringify(fullPayload))
  
  const signature = await hmacSha256(JWT_SECRET, `${headerEncoded}.${payloadEncoded}`)
  
  return `${headerEncoded}.${payloadEncoded}.${signature}`
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerEncoded, payloadEncoded, signature] = parts
    
    // Verify signature
    const expectedSignature = await hmacSha256(JWT_SECRET, `${headerEncoded}.${payloadEncoded}`)
    if (signature !== expectedSignature) return null
    
    // Decode payload
    const payload: JWTPayload = JSON.parse(base64urlDecode(payloadEncoded))
    
    // Check expiry
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Hash password using SHA-256
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Authentication middleware
 */
export const authMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing token' }, 401)
  }
  
  const token = authHeader.substring(7)
  const payload = await verifyToken(token)
  
  if (!payload) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401)
  }
  
  // Attach user info to context
  c.set('user', payload)
  
  await next()
})

/**
 * Admin-only middleware
 */
export const adminMiddleware = createMiddleware<{ Bindings: Bindings }>(async (c, next) => {
  const user = c.get('user') as JWTPayload | undefined
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403)
  }
  
  await next()
})

/**
 * Extract user from context
 */
export function getCurrentUser(c: any): JWTPayload | null {
  return c.get('user') || null
}
