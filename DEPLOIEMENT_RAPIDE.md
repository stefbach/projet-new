# ⚡ Déploiement Rapide - 5 Minutes

## 🎯 Objectif

Déployer TIBOK Medical Evaluation sur Cloudflare Pages en **5 minutes** avec un script automatique.

---

## 📋 Prérequis (2 minutes)

### 1️⃣ Compte Cloudflare (Gratuit)

Si vous n'avez pas encore de compte :
- Allez sur : https://dash.cloudflare.com/sign-up
- Créez un compte gratuit

### 2️⃣ API Token Cloudflare

**Via GenSpark (RECOMMANDÉ) :**
1. Ouvrez l'onglet **"Deploy"** dans GenSpark
2. Cliquez sur **"Cloudflare API Key Setup"**
3. Suivez les instructions
4. Copiez-collez votre token

**Ou manuellement :**
1. https://dash.cloudflare.com/profile/api-tokens
2. **"Create Token"** → **"Edit Cloudflare Workers"**
3. Copiez le token généré

---

## 🚀 Déploiement Automatique (3 minutes)

### Option 1 : Script Automatique (RECOMMANDÉ)

```bash
# 1. Naviguer vers le projet
cd /home/user/webapp

# 2. Lancer le script de déploiement
./deploy.sh
```

Le script va automatiquement :
- ✅ Vérifier les dépendances
- ✅ Installer les packages
- ✅ Builder le projet
- ✅ Créer la base de données D1 (si nécessaire)
- ✅ Créer le projet Cloudflare Pages (si nécessaire)
- ✅ Déployer l'application
- ✅ Tester l'API

**Temps estimé :** 2-3 minutes

---

### Option 2 : Commandes Manuelles

Si vous préférez exécuter les commandes une par une :

```bash
cd /home/user/webapp

# 1. Build
npm run build

# 2. Créer la base D1 (première fois seulement)
npx wrangler d1 create tibok-medical-db-production
# ⚠️ Copiez le database_id dans wrangler.jsonc

# 3. Appliquer les migrations
npx wrangler d1 migrations apply tibok-medical-db-production --remote

# 4. Créer le projet Pages (première fois seulement)
npx wrangler pages project create tibok-medical-evaluation \
  --production-branch main

# 5. Déployer
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

---

## ✅ Vérification (30 secondes)

### Test Rapide

```bash
# Récupérer l'URL de déploiement
curl https://tibok-medical-evaluation.pages.dev/api/health
```

**Résultat attendu :**
```json
{
  "success": true,
  "service": "Tibok Medical Evaluation",
  "version": "1.0.0"
}
```

### Ouvrir dans le Navigateur

```
https://tibok-medical-evaluation.pages.dev/static/login
```

**Credentials :**
- Email : `admin@tibok.mu`
- Password : `password123`

---

## 🌐 Ajouter un Nom de Domaine (Optionnel)

### Si votre domaine est sur Cloudflare

```bash
npx wrangler pages domain add votre-domaine.com \
  --project-name tibok-medical-evaluation
```

### Si votre domaine est ailleurs

1. Ajoutez un CNAME chez votre registrar :
   ```
   Type: CNAME
   Nom: @
   Valeur: tibok-medical-evaluation.pages.dev
   ```

2. Attendez la propagation DNS (15 min - 48h)

3. Testez :
   ```bash
   curl https://votre-domaine.com/api/health
   ```

---

## 🔄 Mises à Jour Futures

Pour déployer une nouvelle version :

```bash
cd /home/user/webapp

# Méthode 1 : Script automatique
./deploy.sh

# Méthode 2 : Commandes manuelles
npm run build
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

---

## 📊 URLs d'Accès

Après déploiement, vos URLs seront :

### Production Cloudflare Pages
```
https://tibok-medical-evaluation.pages.dev
```

### Interfaces Principales
- **Login** : `/static/login`
- **Évaluation** : `/static/start-evaluation-direct.html`
- **Dashboard Admin** : `/static/admin-dashboard-full.html`
- **API Health** : `/api/health`

---

## 🆘 Problèmes Courants

### ❌ "Not authenticated"

**Solution :**
```bash
# Vérifier l'authentification
npx wrangler whoami

# Si erreur, re-configurer le token
export CLOUDFLARE_API_TOKEN="votre_token"
```

### ❌ "Database not found"

**Solution :**
1. Vérifiez que le `database_id` est correct dans `wrangler.jsonc`
2. Créez la base si nécessaire :
   ```bash
   npx wrangler d1 create tibok-medical-db-production
   ```

### ❌ "Build failed"

**Solution :**
```bash
# Nettoyer et rebuilder
rm -rf node_modules dist .wrangler
npm install
npm run build
```

---

## 📖 Documentation Complète

Pour plus de détails (domaines personnalisés, SSL, CI/CD, etc.) :

**[GUIDE_DEPLOIEMENT_COMPLET.md](./GUIDE_DEPLOIEMENT_COMPLET.md)**

---

## ⏱️ Récapitulatif des Temps

| Étape | Temps |
|---|---|
| Créer compte Cloudflare | 2 min |
| Obtenir API Token | 1 min |
| Exécuter `./deploy.sh` | 2-3 min |
| Vérification | 30 sec |
| **TOTAL** | **≈ 5-6 minutes** |

---

## 🎉 Félicitations !

Votre application est maintenant déployée en production sur Cloudflare Pages !

**Bénéfices :**
- ✅ Hébergement gratuit
- ✅ SSL automatique
- ✅ CDN mondial (275+ villes)
- ✅ Temps de réponse < 50ms
- ✅ Déploiements illimités
- ✅ Rollback instantané

---

**Version** : v1.6.2 FINAL  
**Date** : 27 novembre 2025  
**Status** : 🚀 Production Ready
