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

export default evaluations
