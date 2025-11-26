// Tibok Medical Evaluation - Main Application
// Système d'évaluation médicale IA pour téléconsultation

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { Bindings } from './types/medical'

// Import routes
import authRoutes from './routes/auth'
import doctorsRoutes from './routes/doctors'
import sessionsRoutes from './routes/sessions'
import generateRoutes from './routes/generate'
import evaluateRoutes from './routes/evaluate'
import adminRoutes from './routes/admin'
import evaluationsRoutes from './routes/evaluations'

const app = new Hono<{ Bindings: Bindings }>()

// CORS pour API
app.use('/api/*', cors())

// Custom middleware to redirect old evaluation URLs BEFORE serveStatic
app.use('/static/*', async (c, next) => {
  const path = c.req.path
  
  // Redirect old evaluation URLs to new one
  if (path === '/static/take-evaluation' || path === '/static/take-evaluation.html') {
    console.log(`🔄 Redirecting ${path} to start-evaluation-direct.html`)
    return c.redirect('/static/start-evaluation-direct.html', 301)
  }
  
  // Continue to serveStatic for all other paths
  await next()
})

// Serve static files
// NOTE: For Cloudflare Pages, after build, files are in dist/static
// So we need to serve from './' not './public'
app.use('/static/*', serveStatic({ root: './' }))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/doctors', doctorsRoutes)
app.route('/api/sessions', sessionsRoutes)
app.route('/api/generate', generateRoutes)
app.route('/api/evaluate', evaluateRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/evaluations', evaluationsRoutes)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    service: 'Tibok Medical Evaluation',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  })
})

// Redirect to homepage
app.get('/', (c) => {
  return c.redirect('/static/index.html')
})

// Admin Dashboard DIRECT (sans JavaScript - tout chargé côté serveur)
app.get('/admin-direct', async (c) => {
  try {
    // Récupérer les stats (version simplifiée sans status qui n'existe pas)
    const stats = await c.env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM doctors) as total_doctors,
        (SELECT COUNT(*) FROM generated_qcm) as total_qcm,
        (SELECT COUNT(*) FROM clinical_cases) as total_cases,
        (SELECT COUNT(*) FROM alerts_doctors) as unresolved_alerts
    `).first()

    // Récupérer tous les médecins
    const doctors = await c.env.DB.prepare(`
      SELECT 
        d.id,
        d.email,
        d.name,
        d.specialty,
        d.license_number,
        d.created_at,
        de.tmcq_total,
        de.status as evaluation_status,
        de.evaluation_date
      FROM doctors d
      LEFT JOIN doctors_evaluations de ON d.id = de.doctor_id
      ORDER BY d.created_at DESC
    `).all()

    return c.html(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TIBOK - Admin Direct</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen p-8">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 mb-8">
                <h1 class="text-3xl font-bold text-white">
                    <i class="fas fa-hospital-user mr-3"></i>
                    TIBOK Medical Evaluation - Admin Direct
                </h1>
                <p class="text-blue-100 mt-2">✅ Tableau de bord administrateur (sans JavaScript)</p>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Total Médecins</p>
                            <p class="text-3xl font-bold text-blue-600">${stats?.total_doctors || 0}</p>
                        </div>
                        <i class="fas fa-user-md text-4xl text-blue-200"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">QCM Disponibles</p>
                            <p class="text-3xl font-bold text-green-600">${stats?.total_qcm || 0}</p>
                        </div>
                        <i class="fas fa-question-circle text-4xl text-green-200"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Cas Cliniques</p>
                            <p class="text-3xl font-bold text-purple-600">${stats?.total_cases || 0}</p>
                        </div>
                        <i class="fas fa-file-medical text-4xl text-purple-200"></i>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-500 text-sm">Alertes Non Résolues</p>
                            <p class="text-3xl font-bold text-red-600">${stats?.unresolved_alerts || 0}</p>
                        </div>
                        <i class="fas fa-exclamation-triangle text-4xl text-red-200"></i>
                    </div>
                </div>
            </div>

            <!-- Doctors Table -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="bg-blue-600 px-6 py-4">
                    <h2 class="text-xl font-bold text-white">
                        <i class="fas fa-users mr-2"></i>
                        Liste des Médecins (${doctors.results.length} total)
                    </h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spécialité</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Enregistrement</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score TMCQ</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${doctors.results.map(doc => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <i class="fas fa-user-circle text-2xl text-blue-400 mr-3"></i>
                                        <div class="font-medium text-gray-900">${doc.name}</div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.email}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${doc.specialty || 'N/A'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${doc.license_number || 'N/A'}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="text-lg font-bold ${doc.tmcq_total >= 75 ? 'text-green-600' : 'text-orange-600'}">
                                        ${doc.tmcq_total ? doc.tmcq_total.toFixed(1) : 'N/A'}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    ${doc.evaluation_status ? `
                                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${doc.evaluation_status === 'apte' ? 'bg-green-100 text-green-800' : 
                                              doc.evaluation_status === 'supervision' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}">
                                            ${doc.evaluation_status === 'apte' ? '✓ Apte' : 
                                              doc.evaluation_status === 'supervision' ? '⚠ Supervision' : 
                                              '✗ Formation requise'}
                                        </span>
                                    ` : '<span class="text-gray-400">Non évalué</span>'}
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Actions rapides -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <a href="/api/health" target="_blank" class="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 text-center shadow-md">
                    <i class="fas fa-heartbeat text-3xl mb-2"></i>
                    <p class="font-semibold">Tester API Health</p>
                </a>
                <a href="/api/admin/stats" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-6 text-center shadow-md">
                    <i class="fas fa-chart-bar text-3xl mb-2"></i>
                    <p class="font-semibold">Stats JSON</p>
                </a>
                <a href="/api/generate/qcm/random?count=5" target="_blank" class="bg-purple-500 hover:bg-purple-600 text-white rounded-lg p-6 text-center shadow-md">
                    <i class="fas fa-random text-3xl mb-2"></i>
                    <p class="font-semibold">5 QCM Aléatoires</p>
                </a>
            </div>

            <!-- Footer -->
            <div class="mt-8 text-center text-gray-500 text-sm">
                <p>TIBOK Medical Evaluation System v1.0.0</p>
                <p class="mt-1">Dernière mise à jour: ${new Date().toLocaleString('fr-FR')}</p>
                <p class="mt-2">
                    <a href="/admin" class="text-blue-600 hover:underline">Version avec JavaScript →</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `)
  } catch (error: any) {
    return c.html(`
      <html>
        <head>
          <title>Erreur TIBOK</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-red-50 p-8">
          <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <h1 class="text-2xl font-bold text-red-600 mb-4">❌ Erreur Serveur</h1>
            <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">${error.message}</pre>
            <div class="mt-4">
              <a href="/" class="text-blue-600 hover:underline">← Retour à l'accueil</a>
            </div>
          </div>
        </body>
      </html>
    `)
  }
})

// Admin Dashboard HTML (accessible via /admin)
app.get('/admin', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tibok Medical Evaluation - Dashboard Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-user-md text-3xl text-blue-600"></i>
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Tibok Medical Evaluation</h1>
                            <p class="text-sm text-gray-500">Système d'évaluation médicale IA</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-600" id="timestamp"></span>
                        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <i class="fas fa-sync-alt mr-2"></i>Actualiser
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="bg-white border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex space-x-8">
                    <button onclick="showTab('dashboard')" class="tab-btn px-4 py-4 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
                        <i class="fas fa-chart-line mr-2"></i>Dashboard
                    </button>
                    <button onclick="showTab('doctors')" class="tab-btn px-4 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                        <i class="fas fa-user-md mr-2"></i>Médecins
                    </button>
                    <button onclick="showTab('audits')" class="tab-btn px-4 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                        <i class="fas fa-file-medical mr-2"></i>Audits
                    </button>
                    <button onclick="showTab('alerts')" class="tab-btn px-4 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                        <i class="fas fa-exclamation-triangle mr-2"></i>Alertes
                    </button>
                    <button onclick="showTab('generate')" class="tab-btn px-4 py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                        <i class="fas fa-magic mr-2"></i>Générer Contenu
                    </button>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Dashboard Tab -->
            <div id="tab-dashboard" class="tab-content">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Total Médecins</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-total-doctors">-</p>
                            </div>
                            <i class="fas fa-users text-3xl text-blue-500"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Score T-MCQ Moyen</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-avg-tmcq">-</p>
                            </div>
                            <i class="fas fa-chart-line text-3xl text-green-500"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Alertes Non Résolues</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-alerts">-</p>
                            </div>
                            <i class="fas fa-exclamation-circle text-3xl text-red-500"></i>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Audits Flagged</p>
                                <p class="text-3xl font-bold text-gray-900" id="stat-flagged">-</p>
                            </div>
                            <i class="fas fa-flag text-3xl text-orange-500"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6 mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribution des Statuts</h3>
                    <canvas id="statusChart"></canvas>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Contenu Disponible</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-4 bg-blue-50 rounded-lg">
                            <p class="text-2xl font-bold text-blue-600" id="stat-total-qcm">-</p>
                            <p class="text-sm text-gray-600">QCM Disponibles</p>
                        </div>
                        <div class="text-center p-4 bg-green-50 rounded-lg">
                            <p class="text-2xl font-bold text-green-600" id="stat-total-cases">-</p>
                            <p class="text-sm text-gray-600">Cas Cliniques</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Doctors Tab -->
            <div id="tab-doctors" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">Liste des Médecins</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">T-MCQ</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alertes</th>
                                </tr>
                            </thead>
                            <tbody id="doctors-table" class="bg-white divide-y divide-gray-200">
                                <tr>
                                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">Chargement...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Audits Tab -->
            <div id="tab-audits" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">Audits de Consultation</h3>
                    </div>
                    <div id="audits-list" class="divide-y divide-gray-200">
                        <div class="p-6 text-center text-gray-500">Chargement...</div>
                    </div>
                </div>
            </div>

            <!-- Alerts Tab -->
            <div id="tab-alerts" class="tab-content hidden">
                <div class="bg-white rounded-lg shadow">
                    <div class="p-6 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">Alertes Actives</h3>
                    </div>
                    <div id="alerts-list" class="divide-y divide-gray-200">
                        <div class="p-6 text-center text-gray-500">Chargement...</div>
                    </div>
                </div>
            </div>

            <!-- Generate Tab -->
            <div id="tab-generate" class="tab-content hidden">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Générer QCM -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            <i class="fas fa-question-circle mr-2 text-blue-600"></i>Générer QCM
                        </h3>
                        <form id="form-generate-qcm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input type="text" id="qcm-topic" placeholder="Hypertension, Diabète..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input type="number" id="qcm-count" value="10" min="1" max="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                                <select id="qcm-difficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                                    <option value="basic">Basic</option>
                                    <option value="intermediate" selected>Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Guidelines</label>
                                <input type="text" id="qcm-guidelines" placeholder="WHO EML 2023, OMS..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                <i class="fas fa-magic mr-2"></i>Générer QCM
                            </button>
                        </form>
                        <div id="qcm-result" class="mt-4 hidden"></div>
                    </div>

                    <!-- Générer Cas Clinique -->
                    <div class="bg-white rounded-lg shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">
                            <i class="fas fa-file-medical mr-2 text-green-600"></i>Générer Cas Clinique
                        </h3>
                        <form id="form-generate-case" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                                <input type="text" id="case-specialty" placeholder="Cardiologie, Endocrinologie..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Complexité</label>
                                <select id="case-complexity" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" required>
                                    <option value="simple">Simple</option>
                                    <option value="intermediate" selected>Intermediate</option>
                                    <option value="complex">Complex</option>
                                </select>
                            </div>
                            <button type="submit" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                                <i class="fas fa-magic mr-2"></i>Générer Cas Clinique
                            </button>
                        </form>
                        <div id="case-result" class="mt-4 hidden"></div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="/static/admin-dashboard.js"></script>
</body>
</html>
  `)
})

export default app
