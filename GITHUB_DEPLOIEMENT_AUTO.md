# 🔄 GitHub + Déploiement Automatique

## 🎯 Vue d'Ensemble

Ce guide explique comment configurer le déploiement automatique depuis GitHub vers votre plateforme de choix.

---

## ✅ STATUT ACTUEL

Votre code est **déjà sur GitHub** :
- 🔗 **Repository** : https://github.com/stefbach/projet-new
- ✅ **76 fichiers** pushés
- ✅ **Documentation complète**
- ✅ **Scripts de déploiement**

---

## 🚀 OPTION 1 : GitHub → Cloudflare Pages (RECOMMANDÉ)

### Pourquoi Cloudflare Pages ?

✅ **Compatible immédiatement** avec votre code actuel  
✅ **Base de données D1** déjà configurée  
✅ **Script de déploiement** prêt (`./deploy.sh`)  
✅ **Gratuit** et performant  
✅ **Pas de réécriture** nécessaire  

### Configuration en 3 Étapes

#### 1. Configuration API Cloudflare (2 min)

```bash
# Via GenSpark
# Onglet "Deploy" → "Cloudflare API Key Setup"
# Créer token : https://dash.cloudflare.com/profile/api-tokens
# Template: "Edit Cloudflare Workers"
```

#### 2. Premier Déploiement (3 min)

```bash
cd /home/user/webapp
./deploy.sh
```

**Résultat** :
```
✅ Déployé sur : https://tibok-medical-evaluation.pages.dev
```

#### 3. CI/CD avec GitHub Actions (Automatique)

**Créer `.github/workflows/deploy-cloudflare.yml`** :

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tibok-medical-evaluation
          directory: dist
```

**Configuration des Secrets GitHub** :

1. **GitHub Repository** → Settings → Secrets and variables → Actions
2. Ajouter :
   - `CLOUDFLARE_API_TOKEN` : Votre token Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID` : Votre Account ID Cloudflare

**Obtenir l'Account ID** :
```bash
npx wrangler whoami
```

**✅ Terminé !** Chaque push sur `main` déclenchera un déploiement automatique.

---

## 🔄 OPTION 2 : GitHub → Vercel (NON RECOMMANDÉ)

### ⚠️ Limitations pour ce Projet

- ❌ **Pas de D1** : Base de données incompatible
- ❌ **Réécriture majeure** : 5-6 jours de travail
- ❌ **Coûts** : Vercel Postgres, KV, Blob payants
- ❌ **Migration complexe** : Toutes les requêtes à réécrire

### Si Vous Insistez Quand Même

#### 1. Connexion Vercel → GitHub (2 min)

1. Allez sur : https://vercel.com/signup
2. "Continue with GitHub"
3. Autorisez Vercel

#### 2. Importer le Repository (1 min)

1. Dashboard : https://vercel.com/dashboard
2. "Add New..." → "Project"
3. "Import Git Repository"
4. Sélectionnez : `stefbach/projet-new`
5. Configuration :
   ```
   Framework: Other
   Build Command: npm run build
   Output Directory: dist
   ```
6. "Deploy"

#### 3. Déploiements Automatiques

✅ Configuré automatiquement !

- Push sur `main` → Production
- Push sur branche → Preview
- Pull Request → Preview unique

### Travail Requis pour Vercel

**Migration complète nécessaire** :

1. **Remplacer D1 par Postgres** (2-3 jours)
   ```typescript
   // AVANT (D1)
   await c.env.DB.prepare('SELECT * FROM doctors').all()
   
   // APRÈS (Vercel Postgres)
   import { sql } from '@vercel/postgres'
   await sql`SELECT * FROM doctors`
   ```

2. **Remplacer KV** (1 jour)
   ```typescript
   // AVANT (Cloudflare KV)
   await c.env.KV.get('key')
   
   // APRÈS (Vercel KV)
   import { kv } from '@vercel/kv'
   await kv.get('key')
   ```

3. **Adapter tout le code** (2 jours)

**Total : 5-6 jours de développement**

---

## 🎯 RECOMMANDATION FINALE

### Pour TIBOK Medical Evaluation

| Critère | Cloudflare Pages | Vercel |
|---|---|---|
| **Compatibilité** | ✅ Immédiate | ❌ Réécriture |
| **Temps de setup** | ⚡ 5 minutes | ⏱️ 5-6 jours |
| **Base de données** | ✅ D1 gratuit | ❌ Postgres payant |
| **Coût** | ✅ Gratuit | ⚠️ $20-50/mois |
| **Script prêt** | ✅ `./deploy.sh` | ❌ À créer |
| **Documentation** | ✅ Complète | ⚠️ À refaire |

**✅ CHOISISSEZ : Cloudflare Pages**

---

## 📋 WORKFLOW RECOMMANDÉ

### Développement Local

```bash
# 1. Cloner le repo
git clone https://github.com/stefbach/projet-new.git
cd projet-new

# 2. Installer les dépendances
npm install

# 3. Développement local
npm run build
pm2 start ecosystem.config.cjs

# 4. Tester
curl http://localhost:3000/api/health
```

### Modifications et Push

```bash
# 1. Créer une branche
git checkout -b feature/ma-feature

# 2. Faire des modifications
# ... éditer les fichiers ...

# 3. Commit
git add .
git commit -m "✨ Nouvelle fonctionnalité"

# 4. Push vers GitHub
git push origin feature/ma-feature

# 5. Créer une Pull Request sur GitHub
# GitHub → Pull Requests → New Pull Request
```

### Déploiement en Production

```bash
# 1. Merge la PR dans main (via GitHub)

# 2. Déploiement automatique via GitHub Actions
# OU déploiement manuel :
git checkout main
git pull origin main
./deploy.sh
```

---

## 🔧 Configuration GitHub Actions (Cloudflare)

### Fichier Complet

Créez `.github/workflows/deploy-cloudflare.yml` :

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
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tibok-medical-evaluation
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Preview deployed! Check the Cloudflare Pages deployment.'
            })
```

### Secrets à Configurer

**Dans GitHub** → Repository → Settings → Secrets → Actions :

1. `CLOUDFLARE_API_TOKEN`
   - Obtenir : https://dash.cloudflare.com/profile/api-tokens
   - Template : "Edit Cloudflare Workers"

2. `CLOUDFLARE_ACCOUNT_ID`
   - Obtenir via CLI :
     ```bash
     npx wrangler whoami
     ```
   - Ou Dashboard : URL contient l'Account ID

---

## 🎨 Badges GitHub

Ajoutez des badges au README.md :

```markdown
[![Deploy to Cloudflare](https://github.com/stefbach/projet-new/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/stefbach/projet-new/actions/workflows/deploy-cloudflare.yml)
[![GitHub](https://img.shields.io/github/license/stefbach/projet-new)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.6.2-blue.svg)](README.md)
```

---

## 🚀 Démarrage Rapide

### Commandes Essentielles

```bash
# Cloner le projet
git clone https://github.com/stefbach/projet-new.git
cd projet-new

# Setup
npm install

# Build
npm run build

# Déployer sur Cloudflare
./deploy.sh

# Ou déployer manuellement
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

---

## 📊 Statistiques Déploiement

### Après Configuration

- ⚡ **Build time** : ~2 minutes
- 🚀 **Deploy time** : ~30 secondes
- 🌍 **Propagation** : Instantanée (CDN)
- ✅ **Rollback** : 1 clic

---

## 🎯 RÉSUMÉ

### ✅ Ce Qui Est Déjà Fait

- ✅ Code sur GitHub
- ✅ Documentation complète
- ✅ Script de déploiement
- ✅ Configuration Cloudflare prête

### 🚀 Pour Déployer Maintenant

```bash
# 1. Configure API Token (2 min)
# Onglet "Deploy" dans GenSpark

# 2. Deploy (3 min)
cd /home/user/webapp
./deploy.sh

# 3. Configure GitHub Actions (5 min)
# Créer .github/workflows/deploy-cloudflare.yml
# Ajouter secrets dans GitHub
```

### 📈 Résultat Final

- ✅ Déploiement automatique à chaque push
- ✅ URL de production stable
- ✅ Preview pour chaque PR
- ✅ Rollback instantané si problème

---

**Version** : Guide GitHub Auto-Deploy v1.0  
**Date** : 27 novembre 2025  
**Status** : ✅ Prêt pour GitHub + Cloudflare
