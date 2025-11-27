// ⚠️ AVERTISSEMENT CRITIQUE
// Ce fichier retourne un status "warning" car Vercel ne supporte pas Cloudflare D1
// La base de données ne fonctionnera PAS sur Vercel

export default async function handler(req, res) {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({
    status: 'warning',
    message: 'API is running but DATABASE IS NOT AVAILABLE',
    platform: 'Vercel',
    database_status: 'unavailable',
    reason: 'Cloudflare D1 is not supported on Vercel',
    recommendation: {
      platform: 'Cloudflare Pages',
      deployment_command: './deploy.sh',
      estimated_time: '5 minutes',
      cost: '0€',
      documentation: 'See GUIDE_RAPIDE_DEPLOY.md'
    },
    alternatives: {
      option_1: 'Deploy on Cloudflare Pages (recommended)',
      option_2: 'Migrate to Vercel Postgres (5-6 days + $20-50/month)',
      option_3: 'Use Cloudflare for backend + Vercel for frontend (complex)'
    },
    build_info: {
      timestamp: new Date().toISOString(),
      node_version: process.version,
      environment: process.env.NODE_ENV || 'development'
    }
  });
}
