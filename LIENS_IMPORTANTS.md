# 🔗 Liens Importants - TIBOK Medical Evaluation

## 📍 Repository GitHub

**Repository principal** : https://github.com/stefbach/projet-new

### Actions GitHub
- **Workflows** : https://github.com/stefbach/projet-new/actions
- **Settings** : https://github.com/stefbach/projet-new/settings
- **Secrets** : https://github.com/stefbach/projet-new/settings/secrets/actions

---

## 🚀 Cloudflare

### Dashboard Principal
- **Dashboard** : https://dash.cloudflare.com
- **API Tokens** : https://dash.cloudflare.com/profile/api-tokens
- **Pages** : https://dash.cloudflare.com/pages
- **D1 Database** : https://dash.cloudflare.com/d1

### Documentation
- **Pages Docs** : https://developers.cloudflare.com/pages/
- **D1 Docs** : https://developers.cloudflare.com/d1/
- **Workers Docs** : https://developers.cloudflare.com/workers/
- **Wrangler Docs** : https://developers.cloudflare.com/workers/wrangler/

---

## 🌐 URLs de Production (Après Déploiement)

### URLs Principales
```
Production : https://tibok-medical-evaluation.pages.dev
Login Admin : https://tibok-medical-evaluation.pages.dev/static/login
Dashboard : https://tibok-medical-evaluation.pages.dev/static/admin-dashboard-full.html
API Health : https://tibok-medical-evaluation.pages.dev/api/health
```

### Interface Médecin
```
Login : https://tibok-medical-evaluation.pages.dev/static/login
Démarrer Évaluation : https://tibok-medical-evaluation.pages.dev/static/start-evaluation-direct.html
Passer Évaluation : https://tibok-medical-evaluation.pages.dev/static/take-evaluation-simple.html
Résultats : https://tibok-medical-evaluation.pages.dev/static/evaluation-results.html?id=[id]
Rapport Narratif : https://tibok-medical-evaluation.pages.dev/static/narrative-report.html?id=[id]
```

---

## 📚 Documentation Locale

### Guides Principaux
```
README.md                           - Vue d'ensemble du projet
GUIDE_DEPLOIEMENT_COMPLET.md       - Guide de déploiement détaillé
GUIDE_RAPIDE_DEPLOY.md             - Déploiement en 5 minutes
GITHUB_VERCEL_INTEGRATION.md       - GitHub + Vercel/Cloudflare
GITHUB_DEPLOIEMENT_AUTO.md         - CI/CD avec GitHub Actions
DEPLOIEMENT_VERCEL.md              - Guide Vercel (non recommandé)
DEPLOIEMENT_RAPIDE.md              - Déploiement rapide Cloudflare
URLS_ACCES_DIRECT.md               - URLs d'accès direct
```

### Guides Techniques
```
GUIDE_EVALUATION_REPONSES.md       - Système de réponses évaluation
REPONSE_UTILISATEUR_EVALUATION.md  - Documentation réponses utilisateur
```

---

## 🛠️ Outils et Commandes

### Commandes Git Essentielles
```bash
# Status
git status

# Historique
git log --oneline

# Branches
git branch -a

# Créer branche
git checkout -b ma-branche

# Push
git push origin main

# Pull
git pull origin main
```

### Commandes Déploiement
```bash
# Déploiement automatique
./deploy.sh

# Build local
npm run build

# Déploiement manuel
npx wrangler pages deploy dist --project-name tibok-medical-evaluation

# Voir déploiements
npx wrangler pages deployment list --project-name tibok-medical-evaluation

# Logs
npx wrangler pages deployment tail --project-name tibok-medical-evaluation
```

### Commandes Database D1
```bash
# Créer database
npx wrangler d1 create tibok-medical-db

# Migrations locales
npm run db:migrate:local

# Migrations production
npm run db:migrate:prod

# Seed data
npm run db:seed

# Console locale
npm run db:console:local

# Console production
npm run db:console:prod

# Reset database locale
npm run db:reset
```

### Commandes Wrangler
```bash
# Login
npx wrangler login

# Who am I
npx wrangler whoami

# Logout
npx wrangler logout

# Version
npx wrangler --version
```

---

## 🔐 Configuration Requise

### Secrets Cloudflare (Local)
Fichier `.dev.vars` :
```
OPENAI_API_KEY=sk-...
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Secrets GitHub Actions
Dans https://github.com/stefbach/projet-new/settings/secrets/actions :
```
CLOUDFLARE_API_TOKEN     - Token depuis dash.cloudflare.com
CLOUDFLARE_ACCOUNT_ID    - Account ID depuis npx wrangler whoami
```

### Secrets Cloudflare Production
```bash
# Ajouter un secret
npx wrangler pages secret put OPENAI_API_KEY --project-name tibok-medical-evaluation

# Lister les secrets
npx wrangler pages secret list --project-name tibok-medical-evaluation
```

---

## 📊 Monitoring et Analytics

### GitHub
- **Actions** : https://github.com/stefbach/projet-new/actions
- **Insights** : https://github.com/stefbach/projet-new/pulse
- **Network** : https://github.com/stefbach/projet-new/network

### Cloudflare
- **Analytics** : https://dash.cloudflare.com/pages/tibok-medical-evaluation/analytics
- **Logs** : https://dash.cloudflare.com/pages/tibok-medical-evaluation/logs
- **Deployments** : https://dash.cloudflare.com/pages/tibok-medical-evaluation/deployments

---

## 🎯 Quick Start

### Premier Déploiement
```bash
# 1. Obtenir token Cloudflare
https://dash.cloudflare.com/profile/api-tokens

# 2. Déployer
cd /home/user/webapp
./deploy.sh

# 3. Tester
curl https://tibok-medical-evaluation.pages.dev/api/health
```

### Activer CI/CD
```bash
# 1. Obtenir Account ID
npx wrangler whoami

# 2. Ajouter secrets sur GitHub
https://github.com/stefbach/projet-new/settings/secrets/actions

# 3. Créer workflow
cat .github/workflows/deploy.yml

# 4. Push
git add .github/workflows/deploy.yml
git commit -m "🚀 CI/CD"
git push origin main
```

### Développement Local
```bash
# 1. Cloner
git clone https://github.com/stefbach/projet-new.git
cd projet-new

# 2. Install
npm install

# 3. Build
npm run build

# 4. Migrate DB
npm run db:migrate:local
npm run db:seed

# 5. Start
pm2 start ecosystem.config.cjs

# 6. Test
curl http://localhost:3000/api/health
```

---

## 🆘 Support et Aide

### Documentation Officielle
- **Cloudflare Pages** : https://developers.cloudflare.com/pages/
- **GitHub Actions** : https://docs.github.com/actions
- **Hono Framework** : https://hono.dev/
- **Wrangler CLI** : https://developers.cloudflare.com/workers/wrangler/

### Communautés
- **Cloudflare Discord** : https://discord.cloudflare.com/
- **Cloudflare Community** : https://community.cloudflare.com/
- **GitHub Discussions** : https://github.com/stefbach/projet-new/discussions

### Contact
- **Repository Issues** : https://github.com/stefbach/projet-new/issues
- **Email Support** : [votre email]

---

## 📦 Archives et Backups

### Archives Disponibles
```
v1.6.2 FINAL : https://www.genspark.ai/api/files/s/Yr71rJhX
```

### Créer une Nouvelle Archive
```bash
cd /home/user/webapp
tar -czf tibok-eval-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=dist \
  .
```

---

## 🎉 Checklist Déploiement

### Pré-Déploiement
- [ ] Code sur GitHub
- [ ] Token Cloudflare obtenu
- [ ] Account ID récupéré
- [ ] `.dev.vars` configuré (local)
- [ ] Tests locaux passés

### Déploiement Initial
- [ ] `./deploy.sh` exécuté avec succès
- [ ] URL production accessible
- [ ] API health check OK
- [ ] Login admin fonctionnel
- [ ] Dashboard accessible

### CI/CD Configuration
- [ ] `.github/workflows/deploy.yml` créé
- [ ] Secrets GitHub configurés
- [ ] Premier workflow déclenché
- [ ] Déploiement automatique validé

### Post-Déploiement
- [ ] Domaine personnalisé (optionnel)
- [ ] SSL/TLS configuré
- [ ] Analytics activé
- [ ] Monitoring en place
- [ ] Documentation à jour

---

**Version** : v1.0  
**Date** : 27 novembre 2025  
**Status** : ✅ Complete Reference Guide
