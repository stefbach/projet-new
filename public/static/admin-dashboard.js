// Tibok Medical Evaluation - Admin Dashboard Frontend

const API_BASE = '/api'
let statusChart = null

// Update timestamp
function updateTimestamp() {
  document.getElementById('timestamp').textContent = new Date().toLocaleString('fr-FR')
}
updateTimestamp()
setInterval(updateTimestamp, 1000)

// Tab management
function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'))
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('border-blue-600', 'text-blue-600')
    btn.classList.add('border-transparent', 'text-gray-500')
  })
  
  document.getElementById(`tab-${tabName}`).classList.remove('hidden')
  event.target.closest('.tab-btn').classList.remove('border-transparent', 'text-gray-500')
  event.target.closest('.tab-btn').classList.add('border-blue-600', 'text-blue-600')
  
  // Load data for the tab
  switch(tabName) {
    case 'dashboard':
      loadDashboard()
      break
    case 'doctors':
      loadDoctors()
      break
    case 'audits':
      loadAudits()
      break
    case 'alerts':
      loadAlerts()
      break
  }
}

// Load dashboard stats
async function loadDashboard() {
  try {
    const response = await axios.get(`${API_BASE}/admin/stats`)
    const { stats } = response.data
    
    document.getElementById('stat-total-doctors').textContent = stats.total_doctors
    document.getElementById('stat-avg-tmcq').textContent = stats.average_tmcq_30days
    document.getElementById('stat-flagged').textContent = stats.flagged_audits
    
    // Calculate total unresolved alerts
    const totalAlerts = stats.unresolved_alerts.reduce((sum, item) => sum + item.count, 0)
    document.getElementById('stat-alerts').textContent = totalAlerts
    
    // Content stats
    document.getElementById('stat-total-qcm').textContent = stats.content.total_qcm || 0
    document.getElementById('stat-total-cases').textContent = stats.content.total_cases || 0
    
    // Status chart
    const statusData = stats.status_distribution
    const labels = statusData.map(s => {
      if (s.status === 'apte') return 'Apte'
      if (s.status === 'supervision') return 'Supervision'
      return 'Formation Requise'
    })
    const values = statusData.map(s => s.count)
    
    if (statusChart) statusChart.destroy()
    
    const ctx = document.getElementById('statusChart').getContext('2d')
    statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  }
}

// Load doctors list
async function loadDoctors() {
  try {
    const response = await axios.get(`${API_BASE}/admin/doctors`)
    const { doctors } = response.data
    
    const tbody = document.getElementById('doctors-table')
    
    if (doctors.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Aucun médecin trouvé</td></tr>'
      return
    }
    
    tbody.innerHTML = doctors.map(doctor => {
      const statusBadge = getStatusBadge(doctor.evaluation_status)
      const alertsBadge = doctor.unresolved_alerts > 0 
        ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">${doctor.unresolved_alerts}</span>`
        : '<span class="text-gray-400">-</span>'
      
      return `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">${doctor.name}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${doctor.email}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${doctor.specialty || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-semibold ${getTMCQColor(doctor.tmcq_total)}">${doctor.tmcq_total || '-'}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
          <td class="px-6 py-4 whitespace-nowrap">${alertsBadge}</td>
        </tr>
      `
    }).join('')
  } catch (error) {
    console.error('Failed to load doctors:', error)
  }
}

// Load audits
async function loadAudits() {
  try {
    const response = await axios.get(`${API_BASE}/admin/audits?limit=20`)
    const { audits } = response.data
    
    const container = document.getElementById('audits-list')
    
    if (audits.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-gray-500">Aucun audit trouvé</div>'
      return
    }
    
    container.innerHTML = audits.map(audit => {
      const severityBadge = getSeverityBadge(audit.severity)
      const flaggedBadge = audit.flagged 
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><i class="fas fa-flag mr-1"></i>Flagged</span>'
        : ''
      
      return `
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-semibold text-gray-900">${audit.doctor_name}</h4>
              <p class="text-xs text-gray-500">${audit.doctor_email}</p>
            </div>
            <div class="flex items-center space-x-2">
              ${severityBadge}
              ${flaggedBadge}
            </div>
          </div>
          <div class="grid grid-cols-5 gap-4 mb-3">
            <div>
              <p class="text-xs text-gray-500">Anamnèse</p>
              <p class="text-sm font-semibold">${audit.anamnese_score}/100</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Diagnostic</p>
              <p class="text-sm font-semibold">${audit.diagnostic_score}/100</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Prescription</p>
              <p class="text-sm font-semibold">${audit.prescription_score}/100</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Red Flags</p>
              <p class="text-sm font-semibold">${audit.red_flags_score}/100</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Global</p>
              <p class="text-sm font-bold ${getTMCQColor(audit.global_score)}">${audit.global_score}/100</p>
            </div>
          </div>
          <p class="text-xs text-gray-400">${new Date(audit.created_at).toLocaleString('fr-FR')}</p>
        </div>
      `
    }).join('')
  } catch (error) {
    console.error('Failed to load audits:', error)
  }
}

// Load alerts
async function loadAlerts() {
  try {
    const response = await axios.get(`${API_BASE}/admin/alerts?resolved=0`)
    const { alerts } = response.data
    
    const container = document.getElementById('alerts-list')
    
    if (alerts.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-gray-500">Aucune alerte active</div>'
      return
    }
    
    container.innerHTML = alerts.map(alert => {
      const severityBadge = getSeverityBadge(alert.severity)
      const typeBadge = getAlertTypeBadge(alert.alert_type)
      
      return `
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="text-sm font-semibold text-gray-900">${alert.doctor_name}</h4>
              <p class="text-xs text-gray-500">${alert.doctor_email}</p>
            </div>
            <div class="flex items-center space-x-2">
              ${typeBadge}
              ${severityBadge}
            </div>
          </div>
          <p class="text-sm text-gray-700 mb-3">${alert.message}</p>
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-400">${new Date(alert.created_at).toLocaleString('fr-FR')}</p>
            <button onclick="resolveAlert('${alert.id}')" class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              <i class="fas fa-check mr-1"></i>Résoudre
            </button>
          </div>
        </div>
      `
    }).join('')
  } catch (error) {
    console.error('Failed to load alerts:', error)
  }
}

// Resolve alert
async function resolveAlert(alertId) {
  try {
    await axios.put(`${API_BASE}/admin/alert/${alertId}/resolve`)
    loadAlerts()
  } catch (error) {
    console.error('Failed to resolve alert:', error)
    alert('Erreur lors de la résolution de l\'alerte')
  }
}

// Generate QCM
document.getElementById('form-generate-qcm').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const btn = e.target.querySelector('button[type="submit"]')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Génération en cours...'
  
  try {
    const response = await axios.post(`${API_BASE}/generate/qcm`, {
      topic: document.getElementById('qcm-topic').value,
      count: parseInt(document.getElementById('qcm-count').value),
      difficulty: document.getElementById('qcm-difficulty').value,
      guidelines: document.getElementById('qcm-guidelines').value
    })
    
    const result = document.getElementById('qcm-result')
    result.classList.remove('hidden')
    result.innerHTML = `
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm font-medium text-green-800">
          <i class="fas fa-check-circle mr-2"></i>
          ${response.data.count} QCM générés avec succès !
        </p>
      </div>
    `
    
    e.target.reset()
    loadDashboard() // Refresh stats
  } catch (error) {
    const result = document.getElementById('qcm-result')
    result.classList.remove('hidden')
    result.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm font-medium text-red-800">
          <i class="fas fa-exclamation-circle mr-2"></i>
          Erreur: ${error.response?.data?.error || error.message}
        </p>
      </div>
    `
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-magic mr-2"></i>Générer QCM'
  }
})

// Generate Clinical Case
document.getElementById('form-generate-case').addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const btn = e.target.querySelector('button[type="submit"]')
  btn.disabled = true
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Génération en cours...'
  
  try {
    const response = await axios.post(`${API_BASE}/generate/clinical-case`, {
      specialty: document.getElementById('case-specialty').value,
      complexity: document.getElementById('case-complexity').value
    })
    
    const result = document.getElementById('case-result')
    result.classList.remove('hidden')
    result.innerHTML = `
      <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm font-medium text-green-800">
          <i class="fas fa-check-circle mr-2"></i>
          Cas clinique "${response.data.clinical_case.title}" généré avec succès !
        </p>
      </div>
    `
    
    e.target.reset()
    loadDashboard() // Refresh stats
  } catch (error) {
    const result = document.getElementById('case-result')
    result.classList.remove('hidden')
    result.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm font-medium text-red-800">
          <i class="fas fa-exclamation-circle mr-2"></i>
          Erreur: ${error.response?.data?.error || error.message}
        </p>
      </div>
    `
  } finally {
    btn.disabled = false
    btn.innerHTML = '<i class="fas fa-magic mr-2"></i>Générer Cas Clinique'
  }
})

// Utility functions
function getStatusBadge(status) {
  if (!status) return '<span class="text-gray-400">-</span>'
  
  const badges = {
    'apte': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Apte</span>',
    'supervision': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Supervision</span>',
    'formation_requise': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Formation</span>'
  }
  
  return badges[status] || '<span class="text-gray-400">-</span>'
}

function getSeverityBadge(severity) {
  const badges = {
    'low': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Faible</span>',
    'medium': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Moyen</span>',
    'high': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Élevé</span>',
    'critical': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Critique</span>'
  }
  
  return badges[severity] || ''
}

function getAlertTypeBadge(type) {
  const badges = {
    'low_score': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Score Faible</span>',
    'red_flag_missed': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Red Flag</span>',
    'non_compliance': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Non-Conformité</span>',
    'prescription_error': '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Prescription</span>'
  }
  
  return badges[type] || ''
}

function getTMCQColor(score) {
  if (!score) return 'text-gray-400'
  if (score >= 85) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

// Initial load
loadDashboard()
