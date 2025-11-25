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
        gq.id, gq.topic, gq.category, gq.difficulty, gq.question, gq.options, gq.correct_answer, gq.explanation, gq.reference
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
          patient_profile: c.patient_profile,
          presentation: c.presentation,
          anamnesis: JSON.parse(c.anamnesis as string),
          questions: JSON.parse(c.questions as string)
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
    const { evaluation_id, answers, duration_seconds } = await c.req.json()
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const token = authHeader.substring(7)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const doctorId = payload.doctor_id
    
    // For now, return mock results
    // TODO: Calculate actual scores based on answers
    const mockScore = 75 + Math.random() * 20
    
    return c.json({
      success: true,
      result: {
        id: `result-${Date.now()}`,
        evaluation_id,
        doctor_id: doctorId,
        tmcq_score: mockScore,
        qcm_score: 80,
        case_score: 70,
        status: mockScore >= 75 ? 'apte' : mockScore >= 60 ? 'supervision_requise' : 'formation_requise',
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
    
    // For now, return mock results
    // TODO: Retrieve actual results from database
    const mockScore = 75 + Math.random() * 20
    
    return c.json({
      success: true,
      results: {
        id: resultId,
        evaluation_name: 'Évaluation Médicale Générale',
        tmcq_score: mockScore,
        qcm_score: 80,
        case_score: 70,
        qcm_correct: 8,
        qcm_total: 10,
        case_correct: 2,
        case_total: 3,
        status: mockScore >= 75 ? 'apte' : mockScore >= 60 ? 'supervision_requise' : 'formation_requise',
        created_at: new Date().toISOString(),
        details: {
          qcms: [],
          cases: []
        }
      }
    })
  } catch (error: any) {
    console.error('Get Results Error:', error)
    return c.json({ error: error.message || 'Failed to get results' }, 500)
  }
})

export default evaluations
