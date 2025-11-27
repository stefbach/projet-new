# 🚀 Guide de Déploiement Vercel avec GitHub

## 📋 Vue d'Ensemble

Vercel est une plateforme de déploiement moderne qui s'intègre parfaitement avec GitHub pour des déploiements automatiques à chaque push.

### ⚠️ IMPORTANT : Limitations de Vercel pour ce Projet

**Vercel N'EST PAS recommandé pour ce projet** car :
- ❌ **Pas de base de données D1** : Vercel ne supporte pas Cloudflare D1
- ❌ **Serverless uniquement** : Pas de Workers persistants
- ❌ **Stockage limité** : Pas d'équivalent KV ou R2 natif
- ❌ **Architecture différente** : Nécessite une réécriture majeure

**✅ RECOMMANDATION : Utilisez Cloudflare Pages** (voir GUIDE_DEPLOIEMENT_COMPLET.md)

---

## 🔄 Si Vous Souhaitez Quand Même Utiliser Vercel

### Option A : Vercel + Base de Données Externe

Vous devrez utiliser une base de données externe compatible :
- **Vercel Postgres** (intégré)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)
- **MongoDB Atlas**

---

## ÉTAPE 1️⃣ : Créer un Compte Vercel

### 1. Inscription

1. Allez sur : https://vercel.com/signup
2. Choisissez **"Continue with GitHub"**
3. Autorisez Vercel à accéder à vos repositories

### 2. Installation Vercel CLI (Optionnel)

```bash
npm install -g vercel
vercel login
```

---

## ÉTAPE 2️⃣ : Connecter GitHub à Vercel

### Via Interface Web (RECOMMANDÉ)

1. **Dashboard Vercel** : https://vercel.com/dashboard

2. **Importer le Projet**
   - Cliquez sur **"Add New..."** → **"Project"**
   - Sélectionnez **"Import Git Repository"**
   - Cherchez : `stefbach/projet-new`
   - Cliquez sur **"Import"**

3. **Configuration du Projet**
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Variables d'Environnement**
   
   Ajoutez ces variables :
   ```
   NODE_ENV=production
   DATABASE_URL=votre_url_database_externe
   JWT_SECRET=votre_secret_jwt
   ```

5. **Déployer**
   - Cliquez sur **"Deploy"**
   - Attendez 2-3 minutes

### Via CLI

```bash
cd /home/user/webapp

# Login
vercel login

# Déployer
vercel

# Pour déployer en production
vercel --prod
```

---

## ÉTAPE 3️⃣ : Configuration Automatique CI/CD

### Déploiements Automatiques

Une fois connecté, Vercel déploie automatiquement :

✅ **Production** : À chaque push sur `main`
- URL : `https://projet-new.vercel.app`

✅ **Preview** : À chaque push sur une branche
- URL : `https://projet-new-git-[branch].vercel.app`

✅ **Pull Requests** : À chaque PR
- URL unique de preview générée

---

## ÉTAPE 4️⃣ : Ajouter un Domaine Personnalisé

### 1. Dans Vercel Dashboard

1. Allez dans votre projet
2. **Settings** → **Domains**
3. Cliquez **"Add Domain"**
4. Entrez : `tibok-medical.com`

### 2. Configuration DNS

Vercel vous donnera des instructions DNS :

**Option A : Nameservers (Recommandé)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B : Enregistrement A**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option C : CNAME**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3. Vérification

Attendez la propagation DNS (5-60 minutes)

```bash
# Vérifier
dig tibok-medical.com
```

---

## ÉTAPE 5️⃣ : Migration Base de Données D1 → Postgres

### Si Vous Choisissez Vercel Postgres

#### 1. Activer Vercel Postgres

```bash
vercel integration add @vercel/postgres
```

Ou via Dashboard :
- **Settings** → **Storage** → **Create Database**
- Sélectionnez **Postgres**

#### 2. Obtenir l'URL de Connexion

```bash
# Ajouter automatiquement les variables d'env
vercel env pull
```

Ou manuellement dans **Settings** → **Environment Variables** :
```
POSTGRES_URL=postgres://...
```

#### 3. Migrer les Données

**Convertir le Schema SQLite → PostgreSQL**

```sql
-- SQLite (D1)
CREATE TABLE doctors (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ...
);

-- PostgreSQL (Vercel)
CREATE TABLE doctors (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  ...
);
```

**Utiliser Prisma pour la Migration (Recommandé)**

```bash
npm install prisma @prisma/client

# Initialiser Prisma
npx prisma init

# Générer le client
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy
```

---

## ÉTAPE 6️⃣ : Adapter le Code pour Vercel

### Modifications Requises

#### 1. Remplacer D1 par Postgres

**Avant (Cloudflare D1)** :
```typescript
const result = await c.env.DB.prepare('SELECT * FROM doctors').all()
```

**Après (Vercel Postgres)** :
```typescript
import { sql } from '@vercel/postgres'

const result = await sql`SELECT * FROM doctors`
```

#### 2. Remplacer KV par Vercel KV

```bash
vercel integration add @vercel/kv
```

```typescript
import { kv } from '@vercel/kv'

// Set
await kv.set('key', 'value')

// Get
const value = await kv.get('key')
```

#### 3. Remplacer R2 par Vercel Blob

```bash
vercel integration add @vercel/blob
```

```typescript
import { put, head, del } from '@vercel/blob'

// Upload
const blob = await put('avatar.png', file, { access: 'public' })

// URL
console.log(blob.url)
```

---

## ÉTAPE 7️⃣ : Webhooks GitHub → Vercel

### Configuration Automatique

Vercel configure automatiquement les webhooks GitHub lors de la connexion.

### Vérification

1. **GitHub** → Votre Repository
2. **Settings** → **Webhooks**
3. Vous devriez voir : `https://api.vercel.com/v1/integrations/deploy/...`

### Événements Déclencheurs

- ✅ Push sur `main` → Déploiement production
- ✅ Push sur autre branche → Preview
- ✅ Pull Request → Preview unique

---

## ÉTAPE 8️⃣ : Monitoring et Logs

### Dashboard Vercel

1. **Deployments** : Voir tous les déploiements
2. **Analytics** : Trafic et performance
3. **Logs** : Logs en temps réel
4. **Speed Insights** : Performance détaillée

### Via CLI

```bash
# Logs en temps réel
vercel logs

# Logs d'un déploiement spécifique
vercel logs [deployment-url]
```

---

## 📊 Comparaison Cloudflare Pages vs Vercel

| Fonctionnalité | Cloudflare Pages | Vercel |
|---|---|---|
| **Hébergement** | ✅ Gratuit illimité | ✅ Gratuit (limites) |
| **Base de données** | ✅ D1 (SQLite) | ⚠️ Vercel Postgres ($) |
| **KV Storage** | ✅ Gratuit (10GB) | ⚠️ Vercel KV ($) |
| **Object Storage** | ✅ R2 | ⚠️ Vercel Blob ($) |
| **Déploiements** | ✅ Illimités | ⚠️ 100/mois (gratuit) |
| **CDN** | ✅ 275+ villes | ✅ Global CDN |
| **SSL** | ✅ Automatique | ✅ Automatique |
| **GitHub Integration** | ✅ Via Actions | ✅ Native |
| **Build Time** | ⚠️ 30 min | ✅ 45 min |
| **Serverless Functions** | ✅ Workers | ✅ Functions |
| **Edge Runtime** | ✅ Oui | ✅ Oui |

---

## 🎯 RECOMMANDATION FINALE

### Pour TIBOK Medical Evaluation

**❌ NE PAS utiliser Vercel** car :
1. Architecture actuelle utilise D1 (incompatible)
2. Nécessite réécriture majeure du code
3. Coûts potentiellement élevés (DB + KV + Blob)
4. Migration complexe

**✅ UTILISER Cloudflare Pages** car :
1. ✅ Code déjà compatible
2. ✅ D1 gratuit (10GB)
3. ✅ KV gratuit
4. ✅ R2 gratuit
5. ✅ Script de déploiement prêt (`./deploy.sh`)
6. ✅ Documentation complète

---

## 🔄 Si Vous Insistez sur Vercel

### Travail Requis

1. **Migrer D1 → Postgres** (2-3 jours)
   - Réécrire toutes les requêtes SQL
   - Adapter le schema
   - Migrer les données existantes

2. **Remplacer KV → Vercel KV** (1 jour)
   - Réécrire l'accès au cache
   - Configurer Vercel KV

3. **Remplacer R2 → Vercel Blob** (1 jour)
   - Réécrire l'upload de fichiers

4. **Adapter Hono pour Vercel** (1 jour)
   - Créer l'adapter Vercel
   - Tester toutes les routes

**Total : 5-6 jours de développement**

---

## 🚀 Déploiement Rapide Cloudflare (5 min)

Au lieu de migrer vers Vercel, déployez maintenant sur Cloudflare :

```bash
cd /home/user/webapp

# 1. Configure API Token (via GenSpark Deploy tab)

# 2. Deploy
./deploy.sh

# 3. Done!
# https://tibok-medical-evaluation.pages.dev
```

---

## 📞 Support

### Vercel
- Documentation : https://vercel.com/docs
- Support : https://vercel.com/support

### Cloudflare Pages
- Documentation : https://developers.cloudflare.com/pages/
- Communauté : https://community.cloudflare.com/

---

## 🎯 Décision Recommandée

**Pour votre projet TIBOK Medical Evaluation :**

✅ **Utilisez Cloudflare Pages** :
- Code déjà prêt
- Documentation complète
- Script de déploiement automatique
- Gratuit et performant

❌ **N'utilisez PAS Vercel** :
- Réécriture majeure requise
- Coûts additionnels
- Temps de migration important

---

**Version** : Guide Vercel v1.0  
**Date** : 27 novembre 2025  
**Recommandation** : ⚠️ Utilisez Cloudflare Pages
