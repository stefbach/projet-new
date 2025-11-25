// Tibok Medical Evaluation - Generation Routes
// Génération IA de contenu médical (QCM, Cas cliniques)

import { Hono } from 'hono'
import type { Bindings, GenerateQCMRequest, GenerateClinicalCaseRequest } from '../types/medical'
import { OpenAIService } from '../lib/openai'

const generate = new Hono<{ Bindings: Bindings }>()

/**
 * POST /api/generate/qcm
 * Génère des QCM médicaux via OpenAI
 */
generate.post('/qcm', async (c) => {
  try {
    const body = await c.req.json()
    
    // Support both 'topic' and 'theme' for backward compatibility
    const topic = body.topic || body.theme
    const count = body.count || 1
    const difficulty = body.difficulty || 'intermediate'
    const guidelines = body.guidelines || 'OMS/WHO Medical Guidelines 2023'

    // Validation
    if (!topic) {
      return c.json({ error: 'Missing required field: topic or theme' }, 400)
    }

    if (count < 1 || count > 50) {
      return c.json({ error: 'Count must be between 1 and 50' }, 400)
    }

    // Récupérer la clé API depuis la base de données
    const apiKeyResult = await c.env.DB.prepare(`
      SELECT config_value FROM api_config WHERE config_key = 'openai_api_key'
    `).first()

    const apiKey = apiKeyResult?.config_value as string

    if (!apiKey || apiKey === '') {
      return c.json({ 
        error: 'OpenAI API key not configured. Please configure it in the Configuration tab.' 
      }, 400)
    }

    // Génération via OpenAI
    const openai = new OpenAIService(apiKey)
    const qcms = await openai.generateQCM(topic, count, difficulty, guidelines)

    // Sauvegarde en base de données
    for (const qcm of qcms) {
      await c.env.DB.prepare(`
        INSERT INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, tags, used_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        qcm.id,
        qcm.topic,
        qcm.category,
        qcm.difficulty,
        qcm.question,
        JSON.stringify(qcm.options),
        qcm.correct_answer,
        qcm.justification,
        qcm.source,
        JSON.stringify(qcm.tags),
        0,
        qcm.created_at
      ).run()
    }

    return c.json({
      success: true,
      count: qcms.length,
      qcms
    })
  } catch (error: any) {
    console.error('QCM Generation Error:', error)
    return c.json({ error: error.message || 'Failed to generate QCM' }, 500)
  }
})

/**
 * POST /api/generate/clinical-case
 * Génère un cas clinique via OpenAI
 */
generate.post('/clinical-case', async (c) => {
  try {
    const { specialty, complexity, patient_profile }: GenerateClinicalCaseRequest = await c.req.json()

    // Validation
    if (!specialty || !complexity) {
      return c.json({ error: 'Missing required fields: specialty, complexity' }, 400)
    }

    // Récupérer la clé API depuis la base de données
    const apiKeyResult = await c.env.DB.prepare(`
      SELECT config_value FROM api_config WHERE config_key = 'openai_api_key'
    `).first()

    const apiKey = apiKeyResult?.config_value as string

    if (!apiKey || apiKey === '') {
      return c.json({ 
        error: 'OpenAI API key not configured. Please configure it in the Configuration tab.' 
      }, 400)
    }

    // Génération via OpenAI
    const openai = new OpenAIService(apiKey)
    const clinicalCase = await openai.generateClinicalCase(specialty, complexity, patient_profile)

    // Sauvegarde en base de données
    await c.env.DB.prepare(`
      INSERT INTO clinical_cases (id, specialty, complexity, title, patient_profile, presentation, anamnesis, questions, red_flags, diagnosis, management, prescription, source, used_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      clinicalCase.id,
      clinicalCase.specialty,
      clinicalCase.complexity,
      clinicalCase.title,
      JSON.stringify(clinicalCase.patient_profile),
      clinicalCase.presentation,
      JSON.stringify(clinicalCase.anamnesis),
      JSON.stringify(clinicalCase.questions),
      JSON.stringify(clinicalCase.red_flags),
      clinicalCase.diagnosis,
      clinicalCase.management,
      JSON.stringify(clinicalCase.prescription),
      clinicalCase.source,
      0,
      clinicalCase.created_at
    ).run()

    return c.json({
      success: true,
      clinical_case: clinicalCase
    })
  } catch (error: any) {
    console.error('Clinical Case Generation Error:', error)
    return c.json({ error: error.message || 'Failed to generate clinical case' }, 500)
  }
})

/**
 * GET /api/generate/qcm/random
 * Récupère des QCM aléatoires de la base
 */
generate.get('/qcm/random', async (c) => {
  try {
    const count = parseInt(c.req.query('count') || '10')
    const difficulty = c.req.query('difficulty')
    const topic = c.req.query('topic')

    let query = 'SELECT * FROM generated_qcm'
    const conditions: string[] = []
    const params: any[] = []

    if (difficulty) {
      conditions.push('difficulty = ?')
      params.push(difficulty)
    }
    if (topic) {
      conditions.push('topic = ?')
      params.push(topic)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY RANDOM() LIMIT ?'
    params.push(count)

    const result = await c.env.DB.prepare(query).bind(...params).all()

    const qcms = result.results.map((row: any) => ({
      ...row,
      options: JSON.parse(row.options),
      tags: JSON.parse(row.tags)
    }))

    return c.json({
      success: true,
      count: qcms.length,
      qcms
    })
  } catch (error: any) {
    console.error('Random QCM Error:', error)
    return c.json({ error: error.message || 'Failed to fetch QCM' }, 500)
  }
})

/**
 * GET /api/generate/clinical-case/random
 * Récupère un cas clinique aléatoire
 */
generate.get('/clinical-case/random', async (c) => {
  try {
    const specialty = c.req.query('specialty')
    const complexity = c.req.query('complexity')

    let query = 'SELECT * FROM clinical_cases'
    const conditions: string[] = []
    const params: any[] = []

    if (specialty) {
      conditions.push('specialty = ?')
      params.push(specialty)
    }
    if (complexity) {
      conditions.push('complexity = ?')
      params.push(complexity)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY RANDOM() LIMIT 1'

    const result = await c.env.DB.prepare(query).bind(...params).first()

    if (!result) {
      return c.json({ error: 'No clinical case found' }, 404)
    }

    const clinicalCase = {
      ...result,
      patient_profile: JSON.parse(result.patient_profile as string),
      anamnesis: JSON.parse(result.anamnesis as string),
      questions: JSON.parse(result.questions as string),
      red_flags: JSON.parse(result.red_flags as string),
      prescription: JSON.parse(result.prescription as string)
    }

    return c.json({
      success: true,
      clinical_case: clinicalCase
    })
  } catch (error: any) {
    console.error('Random Clinical Case Error:', error)
    return c.json({ error: error.message || 'Failed to fetch clinical case' }, 500)
  }
})

export default generate
