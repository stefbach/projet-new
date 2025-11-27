# 🚀 GitHub + Vercel : Guide d'Intégration Simple

## 📋 Vue d'Ensemble

Ce guide vous montre comment connecter votre projet GitHub à Vercel pour des déploiements automatiques.

### ⚠️ AVERTISSEMENT IMPORTANT

**Votre projet TIBOK Medical Evaluation utilise Cloudflare D1 (base de données SQLite).** Vercel n'est **PAS compatible** avec D1.

### Deux Options Possibles

1. **✅ RECOMMANDÉ** : Utilisez Cloudflare Pages (compatible immédiatement)
2. **⚠️ COMPLEXE** : Migrez vers Vercel (nécessite réécriture complète)

---

## 🎯 OPTION 1 : GitHub + Cloudflare Pages (RECOMMANDÉ)

### Pourquoi Cloudflare Pages ?

- ✅ **Code déjà compatible** (aucune modification)
- ✅ **Base de données D1** intégrée
- ✅ **Script de déploiement** prêt (`./deploy.sh`)
- ✅ **100% gratuit** (hosting + DB + CDN)
- ✅ **Déploiement en 5 minutes**

### Étapes Complètes

#### 1️⃣ Configuration Initiale (2 minutes)

**a. Obtenir votre API Token Cloudflare**

```
1. Allez sur : https://dash.cloudflare.com/profile/api-tokens
2. Cliquez "Create Token"
3. Utilisez le template "Edit Cloudflare Workers"
4. Permissions requises :
   - Account → Cloudflare Pages → Edit
   - Account → D1 → Edit
   - Zone → DNS → Edit (optionnel, pour domaine personnalisé)
5. Copiez le token généré
```

**b. Configurer dans GenSpark**

```
1. Onglet "Deploy" dans GenSpark
2. Section "Cloudflare API Key Setup"
3. Collez votre token
4. Cliquez "Save"
```

#### 2️⃣ Premier Déploiement (3 minutes)

```bash
cd /home/user/webapp
./deploy.sh
```

**Le script va :**
- ✅ Installer les dépendances
- ✅ Builder le projet
- ✅ Créer la base de données D1
- ✅ Déployer sur Cloudflare Pages

**Résultat :**
```
✅ Déployé sur : https://tibok-medical-evaluation.pages.dev
```

#### 3️⃣ Déploiement Automatique avec GitHub Actions (5 minutes)

**a. Créer le fichier workflow**

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v3
      
      - name: 🟢 Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: 📦 Install dependencies
        run: npm ci
      
      - name: 🔨 Build project
        run: npm run build
      
      - name: 🚀 Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tibok-medical-evaluation
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

**b. Obtenir votre Account ID**

```bash
# Méthode 1 : Via CLI
npx wrangler whoami

# Méthode 2 : Via Dashboard
# L'URL contient votre Account ID :
# https://dash.cloudflare.com/YOUR_ACCOUNT_ID/...
```

**c. Configurer les secrets GitHub**

```
1. Allez sur : https://github.com/stefbach/projet-new/settings/secrets/actions
2. Cliquez "New repository secret"
3. Ajoutez :
   
   Nom : CLOUDFLARE_API_TOKEN
   Valeur : [votre token Cloudflare]
   
   Nom : CLOUDFLARE_ACCOUNT_ID
   Valeur : [votre account ID]
```

**d. Pusher le workflow**

```bash
git add .github/workflows/deploy.yml
git commit -m "🚀 CI/CD: Déploiement automatique Cloudflare"
git push origin main
```

**✅ C'EST FAIT !**

À partir de maintenant :
- ✅ Chaque push sur `main` → Déploiement automatique
- ✅ Chaque Pull Request → Preview automatique
- ✅ Rollback en 1 clic si problème

---

## 🔄 OPTION 2 : GitHub + Vercel (NON RECOMMANDÉ)

### ⚠️ Limitations Critiques

| Problème | Impact |
|----------|--------|
| ❌ **Pas de D1** | Base de données incompatible |
| ❌ **Réécriture complète** | 5-6 jours de travail |
| ❌ **Coûts mensuels** | $20-50/mois (Postgres + KV + Blob) |
| ❌ **Migration complexe** | Toutes les 84 requêtes SQL à réécrire |

### Si Vous Devez Absolument Utiliser Vercel

#### 1️⃣ Connexion GitHub → Vercel (2 minutes)

```
1. Allez sur : https://vercel.com/signup
2. Cliquez "Continue with GitHub"
3. Autorisez Vercel à accéder à vos repos
4. Suivez les instructions d'installation
```

#### 2️⃣ Importer le Repository (1 minute)

```
1. Dashboard : https://vercel.com/new
2. Cherchez : stefbach/projet-new
3. Cliquez "Import"
4. Configuration :
   - Framework Preset : Other
   - Build Command : npm run build
   - Output Directory : dist
   - Install Command : npm install
5. Cliquez "Deploy"
```

**⚠️ Le déploiement va ÉCHOUER** car le code utilise D1.

#### 3️⃣ Migration Requise (5-6 jours)

**Tâches à accomplir :**

**A. Remplacer D1 par Vercel Postgres (2-3 jours)**

```typescript
// AVANT (Cloudflare D1 - 84 occurrences à changer)
const result = await c.env.DB.prepare(`
  SELECT * FROM doctors WHERE email = ?
`).bind(email).first()

// APRÈS (Vercel Postgres)
import { sql } from '@vercel/postgres'
const result = await sql`
  SELECT * FROM doctors WHERE email = ${email}
`
```

**B. Recréer la base de données (1 jour)**

```bash
# Installer Vercel Postgres
vercel integration add @vercel/postgres

# Convertir migrations SQLite → PostgreSQL
# Fichiers : migrations/*.sql (5 fichiers)
```

**C. Adapter Hono pour Vercel (1 jour)**

```typescript
// Créer api/index.js
import { handle } from 'hono/vercel'
import app from '../src/index'

export default handle(app)
```

**D. Remplacer KV et R2 (1 jour)**

```bash
# Installer Vercel KV et Blob
vercel integration add @vercel/kv
vercel integration add @vercel/blob
```

**COÛT TOTAL** :
- ⏱️ **Temps** : 5-6 jours de développement
- 💰 **Argent** : $20-50/mois
- 🧪 **Tests** : Tout à retester

---

## 🎯 COMPARAISON FINALE

| Critère | Cloudflare Pages | Vercel |
|---------|------------------|--------|
| **Compatibilité** | ✅ Immédiate | ❌ Réécriture complète |
| **Temps de setup** | ⚡ 5 minutes | ⏱️ 5-6 jours |
| **Base de données** | ✅ D1 gratuit (10GB) | ⚠️ Postgres payant |
| **KV Storage** | ✅ Gratuit (10GB) | ⚠️ $0.20/100k reads |
| **Object Storage** | ✅ R2 gratuit | ⚠️ Blob $0.15/GB |
| **Déploiements** | ✅ Illimités | ⚠️ 100/mois (gratuit) |
| **CDN** | ✅ 275+ villes | ✅ Global |
| **SSL** | ✅ Automatique | ✅ Automatique |
| **Script prêt** | ✅ `./deploy.sh` | ❌ À créer |
| **Documentation** | ✅ 6 guides | ❌ À refaire |

### 🏆 VERDICT

**✅ UTILISEZ CLOUDFLARE PAGES**

**Pourquoi ?**
- Code déjà compatible
- Déploiement en 5 minutes
- 100% gratuit
- Documentation complète
- Script automatique prêt

---

## 📚 Workflow Développement Recommandé

### 1. Développement Local

```bash
# Cloner le projet
git clone https://github.com/stefbach/projet-new.git
cd projet-new

# Installer
npm install

# Développer
npm run build
pm2 start ecosystem.config.cjs

# Tester
curl http://localhost:3000/api/health
```

### 2. Créer une Feature

```bash
# Nouvelle branche
git checkout -b feature/ma-nouvelle-feature

# Développer
# ... modifier les fichiers ...

# Commit
git add .
git commit -m "✨ Nouvelle fonctionnalité"

# Push
git push origin feature/ma-nouvelle-feature
```

### 3. Pull Request

```
1. Allez sur : https://github.com/stefbach/projet-new
2. Cliquez "Compare & pull request"
3. Décrivez vos changements
4. Cliquez "Create pull request"
5. ✅ Preview automatique créé (si CI/CD activé)
```

### 4. Merge et Déploiement

```bash
# Après validation de la PR
# 1. Merge sur GitHub (bouton "Merge pull request")

# 2. Déploiement automatique via GitHub Actions
# OU manuel :
git checkout main
git pull origin main
./deploy.sh
```

---

## 🚀 Commandes Essentielles

### Git & GitHub

```bash
# Status
git status

# Voir l'historique
git log --oneline

# Créer une branche
git checkout -b ma-branche

# Changer de branche
git checkout main

# Push vers GitHub
git push origin main

# Pull depuis GitHub
git pull origin main

# Voir les branches
git branch -a
```

### Déploiement

```bash
# Déploiement Cloudflare (automatique)
./deploy.sh

# Déploiement manuel
npm run build
npx wrangler pages deploy dist --project-name tibok-medical-evaluation

# Voir les logs
npx wrangler pages deployment list --project-name tibok-medical-evaluation

# Rollback
npx wrangler pages deployment tail --project-name tibok-medical-evaluation
```

---

## 🎨 Domaine Personnalisé

### Avec Cloudflare Pages

```bash
# Ajouter un domaine
npx wrangler pages domain add tibok-medical.com --project-name tibok-medical-evaluation

# Vérifier le domaine
npx wrangler pages domain list --project-name tibok-medical-evaluation
```

### Configuration DNS

**Si votre domaine est sur Cloudflare** :
```
Automatique ! Cloudflare configure tout seul.
```

**Si votre domaine est ailleurs** :
```
Type : CNAME
Nom : @
Valeur : tibok-medical-evaluation.pages.dev
```

---

## 📊 Monitoring

### GitHub Actions

```
1. Allez sur : https://github.com/stefbach/projet-new/actions
2. Voir tous les déploiements
3. Logs détaillés de chaque build
```

### Cloudflare Dashboard

```
1. Dashboard : https://dash.cloudflare.com
2. Pages → tibok-medical-evaluation
3. Voir :
   - Déploiements récents
   - Analytics
   - Logs
   - Performance
```

---

## 🎯 RÉSUMÉ

### ✅ Ce Qui Est Déjà Fait

- ✅ Code sur GitHub : https://github.com/stefbach/projet-new
- ✅ 76 fichiers synchronisés
- ✅ 6 guides de documentation
- ✅ Script de déploiement automatique
- ✅ Configuration Cloudflare prête

### 🚀 Pour Déployer MAINTENANT

```bash
# 1. Configure API Token (2 min)
# Via GenSpark → Onglet "Deploy"
# Ou https://dash.cloudflare.com/profile/api-tokens

# 2. Deploy (3 min)
cd /home/user/webapp
./deploy.sh

# 3. Configure CI/CD (5 min)
# Créer .github/workflows/deploy.yml
# Ajouter secrets dans GitHub
# Push et c'est automatique !
```

### 📈 Après Configuration

- ✅ URL production : `https://tibok-medical-evaluation.pages.dev`
- ✅ Déploiement automatique à chaque push
- ✅ Preview automatique pour chaque PR
- ✅ Rollback en 1 clic
- ✅ Analytics en temps réel

---

## 📞 Support

### Cloudflare
- 📖 Documentation : https://developers.cloudflare.com/pages/
- 💬 Communauté : https://community.cloudflare.com/
- 📧 Support : https://dash.cloudflare.com/support

### GitHub Actions
- 📖 Documentation : https://docs.github.com/actions
- 💡 Exemples : https://github.com/actions/starter-workflows

### Votre Projet
- 🔗 Repository : https://github.com/stefbach/projet-new
- 📚 Documentation : `GUIDE_DEPLOIEMENT_COMPLET.md`
- 🚀 Script : `./deploy.sh`

---

## ❓ FAQ

### Q: Pourquoi pas Vercel ?
**R:** Votre projet utilise Cloudflare D1 (base de données SQLite). Vercel n'est pas compatible avec D1. Migration = 5-6 jours + coûts mensuels.

### Q: Combien coûte Cloudflare Pages ?
**R:** **100% GRATUIT** pour votre usage :
- ✅ Hosting illimité
- ✅ Base de données D1 (10GB)
- ✅ KV Storage (10GB)
- ✅ R2 Storage (10GB)
- ✅ CDN global
- ✅ SSL automatique
- ✅ 500 builds/mois

### Q: Comment revenir en arrière après un déploiement ?
**R:** 
```bash
# Via dashboard
https://dash.cloudflare.com → Pages → Deployments → Rollback

# Via CLI
npx wrangler pages deployment list
npx wrangler pages deployment rollback
```

### Q: GitHub Actions est-il gratuit ?
**R:** Oui ! 2000 minutes/mois gratuites pour les repos publics, 500 min/mois pour les repos privés.

### Q: Puis-je déployer sur plusieurs environnements ?
**R:** Oui !
- `main` → Production (`tibok-medical-evaluation.pages.dev`)
- `staging` → Staging (`staging.tibok-medical-evaluation.pages.dev`)
- Branches → Preview (`[branch].tibok-medical-evaluation.pages.dev`)

---

**Version** : v1.0  
**Date** : 27 novembre 2025  
**Status** : ✅ Production Ready  
**Recommandation** : 🏆 Utilisez Cloudflare Pages
