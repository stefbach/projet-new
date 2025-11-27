# 🚀 Guide Complet de Déploiement - TIBOK Medical Evaluation

## 📋 Vue d'Ensemble

Ce guide vous explique comment déployer votre système TIBOK Medical Evaluation sur **Cloudflare Pages** avec un **nom de domaine personnalisé**.

---

## ÉTAPE 1️⃣ : Configuration de l'API Cloudflare

### 🔑 Obtenir votre API Token Cloudflare

#### Méthode A : Via GenSpark (RECOMMANDÉ)

1. **Ouvrir l'onglet Deploy dans GenSpark**
   - Cliquez sur "Deploy" dans la barre latérale
   - Suivez les instructions pour "Cloudflare API Key Setup"

2. **Créer un API Token sur Cloudflare**
   - Vous serez redirigé vers : https://dash.cloudflare.com/profile/api-tokens
   - Cliquez sur **"Create Token"**

3. **Choisir le template**
   - Sélectionnez **"Edit Cloudflare Workers"**
   - Ou créez un token personnalisé avec ces permissions :
     - `Account → Cloudflare Pages → Edit`
     - `Account → D1 → Edit`
     - `Zone → DNS → Edit`

4. **Copier le Token**
   - ⚠️ **IMPORTANT** : Copiez le token immédiatement !
   - Vous ne pourrez plus le voir après avoir fermé la page

5. **Coller dans GenSpark**
   - Retournez dans l'onglet "Deploy" de GenSpark
   - Collez votre token dans le champ prévu
   - Cliquez sur "Save"

#### Méthode B : Configuration Manuelle (Alternative)

Si vous préférez configurer manuellement :

```bash
# 1. Créer le fichier .env avec votre token
echo "CLOUDFLARE_API_TOKEN=votre_token_ici" > .env

# 2. Exporter dans votre session
export CLOUDFLARE_API_TOKEN="votre_token_ici"
```

### ✅ Vérifier l'Authentification

```bash
cd /home/user/webapp
npx wrangler whoami
```

**Résultat attendu :**
```
You are logged in with an API Token, associated with the email 'votre-email@example.com'!
```

---

## ÉTAPE 2️⃣ : Créer la Base de Données D1 en Production

### 📊 Créer la Base de Données

```bash
cd /home/user/webapp

# Créer la base de données D1 en production
npx wrangler d1 create tibok-medical-db-production
```

**Résultat :**
```
✅ Successfully created DB 'tibok-medical-db-production'

[[d1_databases]]
binding = "DB"
database_name = "tibok-medical-db-production"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 📝 Mettre à Jour wrangler.jsonc

Copiez le `database_id` obtenu et mettez à jour le fichier `wrangler.jsonc` :

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tibok-medical-evaluation",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tibok-medical-db-production",
      "database_id": "COLLEZ_ICI_LE_DATABASE_ID"
    }
  ]
}
```

### 🗄️ Appliquer les Migrations

```bash
# Appliquer toutes les migrations à la base de données de production
npx wrangler d1 migrations apply tibok-medical-db-production
```

**Confirmation attendue :**
```
✅ Migration 0001_create_doctors.sql applied
✅ Migration 0002_create_evaluations.sql applied
✅ Migration 0003_create_qcm.sql applied
✅ Migration 0004_create_clinical_cases.sql applied
✅ Migration 0005_seed_data.sql applied
```

### ✅ Vérifier la Base de Données

```bash
# Vérifier que les tables sont créées
npx wrangler d1 execute tibok-medical-db-production \
  --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## ÉTAPE 3️⃣ : Build et Déploiement Initial

### 🔨 Build du Projet

```bash
cd /home/user/webapp

# Build du projet
npm run build
```

**Résultat attendu :**
```
vite v6.4.1 building for production...
✓ built in 2.34s
dist/
  _worker.js      245.67 kB
  _routes.json    0.45 kB
```

### 📦 Créer le Projet Cloudflare Pages

```bash
# Créer le projet sur Cloudflare Pages
npx wrangler pages project create tibok-medical-evaluation \
  --production-branch main \
  --compatibility-date 2024-01-01
```

**Confirmation :**
```
✅ Successfully created the 'tibok-medical-evaluation' project.
🌐 View your project at https://tibok-medical-evaluation.pages.dev
```

### 🚀 Premier Déploiement

```bash
# Déployer sur Cloudflare Pages
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

**Résultat :**
```
✨ Success! Uploaded 15 files (3.45 sec)

✅ Deployment complete! Take a peek over at
   https://abc123.tibok-medical-evaluation.pages.dev
```

### ✅ Test du Déploiement

```bash
# Tester l'API Health Check
curl https://tibok-medical-evaluation.pages.dev/api/health
```

**Résultat attendu :**
```json
{
  "success": true,
  "service": "Tibok Medical Evaluation",
  "version": "1.0.0",
  "timestamp": "2025-11-27T16:30:00.000Z"
}
```

---

## ÉTAPE 4️⃣ : Configuration du Nom de Domaine Personnalisé

### 📋 Prérequis

Vous devez avoir un nom de domaine, par exemple :
- `tibok-medical.com`
- `eval.tibok.mu`
- Ou tout autre domaine que vous possédez

### 🌐 Option A : Domaine Géré par Cloudflare (RECOMMANDÉ)

Si votre domaine est déjà sur Cloudflare :

#### 1. Ajouter le Domaine Personnalisé

```bash
# Ajouter votre domaine au projet Pages
npx wrangler pages domain add tibok-medical.com \
  --project-name tibok-medical-evaluation
```

**Ou via sous-domaine :**
```bash
npx wrangler pages domain add eval.tibok-medical.com \
  --project-name tibok-medical-evaluation
```

#### 2. Configuration DNS Automatique

Cloudflare configure automatiquement les enregistrements DNS :
- Type : `CNAME`
- Nom : `@` (pour domaine racine) ou `eval` (pour sous-domaine)
- Cible : `tibok-medical-evaluation.pages.dev`
- Proxy : ✅ Activé (Orange Cloud)

#### 3. Vérification

```bash
# Lister les domaines configurés
npx wrangler pages domain list --project-name tibok-medical-evaluation
```

**Résultat :**
```
Domain: tibok-medical.com
Status: Active ✅
```

### 🌐 Option B : Domaine Externe (Non géré par Cloudflare)

Si votre domaine est chez un autre registrar (GoDaddy, OVH, etc.) :

#### 1. Ajouter le Domaine dans Cloudflare Pages

Via le Dashboard Cloudflare :
1. Allez sur : https://dash.cloudflare.com
2. Sélectionnez votre projet `tibok-medical-evaluation`
3. Onglet **"Custom domains"**
4. Cliquez sur **"Set up a custom domain"**
5. Entrez votre domaine : `tibok-medical.com`

#### 2. Configurer les DNS chez votre Registrar

Cloudflare vous donnera des instructions spécifiques. Généralement :

**Pour domaine racine (tibok-medical.com) :**
```
Type: CNAME
Nom: @
Valeur: tibok-medical-evaluation.pages.dev
TTL: Automatique
```

**Pour sous-domaine (eval.tibok-medical.com) :**
```
Type: CNAME
Nom: eval
Valeur: tibok-medical-evaluation.pages.dev
TTL: Automatique
```

#### 3. Attendre la Propagation DNS

La propagation peut prendre **15 minutes à 48 heures**.

Vérifier avec :
```bash
# Vérifier les DNS
dig tibok-medical.com

# Ou
nslookup tibok-medical.com
```

### ✅ Test du Domaine Personnalisé

```bash
# Tester votre domaine
curl https://tibok-medical.com/api/health

# Ou ouvrir dans le navigateur
open https://tibok-medical.com/static/login
```

---

## ÉTAPE 5️⃣ : Configuration des Variables d'Environnement (Secrets)

### 🔐 Ajouter les Secrets de Production

Si votre application utilise des secrets (API keys, etc.) :

```bash
# OpenAI API Key (si utilisé)
npx wrangler pages secret put OPENAI_API_KEY \
  --project-name tibok-medical-evaluation

# JWT Secret
npx wrangler pages secret put JWT_SECRET \
  --project-name tibok-medical-evaluation

# Admin Password Hash
npx wrangler pages secret put ADMIN_PASSWORD_HASH \
  --project-name tibok-medical-evaluation
```

**Pour chaque commande :**
1. Vous serez invité à entrer la valeur
2. Tapez ou collez la valeur secrète
3. Appuyez sur Entrée

### ✅ Vérifier les Secrets

```bash
# Lister les secrets (valeurs masquées)
npx wrangler pages secret list \
  --project-name tibok-medical-evaluation
```

---

## ÉTAPE 6️⃣ : Configuration du Certificat SSL/TLS

### 🔒 SSL Automatique

Cloudflare Pages active automatiquement le SSL pour votre domaine :

1. **Certificat Universal SSL** (gratuit)
   - Activé par défaut
   - Couvre `tibok-medical.com` et `*.tibok-medical.com`

2. **Vérification SSL**

Via le Dashboard Cloudflare :
- Allez dans **SSL/TLS** → **Overview**
- Mode recommandé : **Full (strict)**

Ou via CLI :
```bash
# Vérifier le certificat
curl -I https://tibok-medical.com
```

**Résultat attendu :**
```
HTTP/2 200
server: cloudflare
```

### 🔄 Forcer HTTPS

Activer la redirection automatique HTTP → HTTPS :

1. Dashboard Cloudflare → SSL/TLS → Edge Certificates
2. Activer **"Always Use HTTPS"**

---

## ÉTAPE 7️⃣ : Déploiements Continus (CI/CD)

### 🔄 Option A : Déploiement Manuel

```bash
# À chaque mise à jour
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

### 🔄 Option B : Via GitHub Actions (Automatique)

#### 1. Créer le fichier `.github/workflows/deploy.yml`

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
          node-version: '18'
      
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
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

#### 2. Configurer les Secrets GitHub

Dans votre repo GitHub :
1. Settings → Secrets and variables → Actions
2. Ajouter :
   - `CLOUDFLARE_API_TOKEN` : Votre token Cloudflare
   - `CLOUDFLARE_ACCOUNT_ID` : Votre Account ID Cloudflare

#### 3. Push et Déploiement Automatique

```bash
git add .
git commit -m "Setup CI/CD with GitHub Actions"
git push origin main
```

Chaque push sur `main` déclenchera automatiquement un déploiement !

---

## ÉTAPE 8️⃣ : Monitoring et Analytics

### 📊 Cloudflare Analytics

1. Dashboard Cloudflare → Pages → `tibok-medical-evaluation`
2. Onglet **"Analytics"** :
   - Requêtes par jour
   - Bande passante
   - Codes de statut HTTP
   - Temps de réponse

### 🔍 Logs en Temps Réel

```bash
# Voir les logs de production
npx wrangler pages deployment tail --project-name tibok-medical-evaluation
```

### 🚨 Alertes Cloudflare

Configurer des alertes :
1. Dashboard Cloudflare → Notifications
2. Créer une alerte pour :
   - Erreurs 5xx
   - Temps de réponse élevé
   - Utilisation quota D1

---

## ÉTAPE 9️⃣ : Rollback en Cas de Problème

### ⏪ Revenir à un Déploiement Précédent

1. **Via Dashboard :**
   - Cloudflare Pages → Deployments
   - Trouvez le déploiement précédent
   - Cliquez sur **"Rollback to this deployment"**

2. **Via CLI :**
```bash
# Lister les déploiements
npx wrangler pages deployment list \
  --project-name tibok-medical-evaluation

# Rollback vers un déploiement spécifique
npx wrangler pages deployment rollback <deployment-id> \
  --project-name tibok-medical-evaluation
```

---

## 📋 CHECKLIST FINALE

Avant de mettre en production, vérifiez :

### ✅ Configuration
- [ ] API Token Cloudflare configuré
- [ ] Base de données D1 créée et migrée
- [ ] `wrangler.jsonc` mis à jour avec le `database_id`
- [ ] Build réussi (`npm run build`)
- [ ] Projet Cloudflare Pages créé

### ✅ Déploiement
- [ ] Premier déploiement réussi
- [ ] Health check fonctionne (`/api/health`)
- [ ] Page de login accessible (`/static/login`)
- [ ] Credentials de test fonctionnent

### ✅ Domaine Personnalisé
- [ ] Domaine ajouté au projet Pages
- [ ] DNS configurés (CNAME)
- [ ] SSL/TLS actif (HTTPS)
- [ ] Redirection HTTP → HTTPS activée
- [ ] Domaine accessible dans le navigateur

### ✅ Sécurité
- [ ] Secrets de production configurés
- [ ] Mode SSL : Full (strict)
- [ ] Credentials par défaut changés (recommandé)
- [ ] `.env` dans `.gitignore`

### ✅ Monitoring
- [ ] Analytics Cloudflare activées
- [ ] Alertes configurées
- [ ] Logs accessibles

---

## 🆘 Dépannage

### ❌ Erreur : "Failed to build"

**Solution :**
```bash
# Nettoyer et rebuilder
rm -rf node_modules dist .wrangler
npm install
npm run build
```

### ❌ Erreur : "Database not found"

**Solution :**
```bash
# Vérifier le database_id dans wrangler.jsonc
cat wrangler.jsonc

# Lister vos bases D1
npx wrangler d1 list
```

### ❌ Erreur : "Domain not resolving"

**Solutions :**
1. Attendre la propagation DNS (jusqu'à 48h)
2. Vérifier les DNS :
   ```bash
   dig tibok-medical.com
   ```
3. Effacer le cache DNS :
   ```bash
   # Sur Mac/Linux
   sudo dscacheutil -flushcache
   
   # Sur Windows
   ipconfig /flushdns
   ```

### ❌ Erreur : "401 Unauthorized"

**Solution :**
```bash
# Re-vérifier votre token
npx wrangler whoami

# Si nécessaire, re-configurer
export CLOUDFLARE_API_TOKEN="votre_nouveau_token"
```

---

## 📞 Support

### Documentation Officielle
- **Cloudflare Pages** : https://developers.cloudflare.com/pages/
- **Cloudflare D1** : https://developers.cloudflare.com/d1/
- **Wrangler CLI** : https://developers.cloudflare.com/workers/wrangler/

### Commandes Utiles

```bash
# Voir toutes les commandes Pages
npx wrangler pages --help

# Voir les commandes D1
npx wrangler d1 --help

# Version de Wrangler
npx wrangler --version
```

---

## 🎯 URLs de Production (Exemples)

Après déploiement complet, vos URLs seront :

### URLs Cloudflare Pages (par défaut)
- **Production** : `https://tibok-medical-evaluation.pages.dev`
- **Branches** : `https://main.tibok-medical-evaluation.pages.dev`

### URLs Domaine Personnalisé
- **Login** : `https://tibok-medical.com/static/login`
- **Évaluation** : `https://tibok-medical.com/static/start-evaluation-direct.html`
- **Dashboard Admin** : `https://tibok-medical.com/static/admin-dashboard-full.html`
- **API Health** : `https://tibok-medical.com/api/health`

---

## 🎉 Félicitations !

Votre système TIBOK Medical Evaluation est maintenant déployé en production sur Cloudflare Pages avec votre nom de domaine personnalisé !

**Points clés :**
- ✅ Hébergement gratuit (jusqu'à 500 builds/mois)
- ✅ SSL automatique
- ✅ CDN mondial (275+ villes)
- ✅ Déploiements illimités
- ✅ Rollback instantané
- ✅ Base de données D1 gratuite (10 GB)

---

**Date de création** : 27 novembre 2025  
**Version** : v1.6.2 FINAL + Guide Déploiement  
**Status** : 🚀 Prêt pour Production
