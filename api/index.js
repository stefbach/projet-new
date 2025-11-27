// ⚠️ AVERTISSEMENT : Ce fichier ne fonctionnera PAS complètement sur Vercel
// car votre projet utilise Cloudflare D1 (base de données SQLite)
// Vercel ne supporte pas D1.

// Pour utiliser Vercel, vous devez :
// 1. Migrer D1 → Vercel Postgres (2-3 jours)
// 2. Réécrire toutes les requêtes SQL (84 occurrences)
// 3. Payer pour Vercel Postgres ($20-50/mois)

// Ce fichier sert uniquement à éviter l'erreur de build Vercel
// Mais l'application NE FONCTIONNERA PAS sans base de données

export default async function handler(req, res) {
  // Vérifier si c'est une route API
  if (req.url.startsWith('/api/health')) {
    return res.status(200).json({
      status: 'error',
      message: 'Ce projet utilise Cloudflare D1 qui n\'est pas compatible avec Vercel',
      recommendation: 'Utilisez Cloudflare Pages à la place',
      deployment_guide: 'Voir GUIDE_DEPLOIEMENT_COMPLET.md',
      cloudflare_deploy: './deploy.sh'
    });
  }

  // Pour toutes les autres routes
  return res.status(503).json({
    error: 'Service Unavailable',
    message: 'Cette application nécessite Cloudflare D1 et ne peut pas fonctionner sur Vercel',
    solution: 'Déployez sur Cloudflare Pages avec ./deploy.sh',
    documentation: [
      'GUIDE_DEPLOIEMENT_COMPLET.md',
      'GUIDE_RAPIDE_DEPLOY.md',
      'SUPPRESSION_VERCEL.md'
    ]
  });
}
