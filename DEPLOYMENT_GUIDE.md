# Guide de Déploiement Production - Tibok Medical Evaluation

## 🎯 Prérequis

### Comptes nécessaires
- ✅ Compte Cloudflare (gratuit : https://dash.cloudflare.com/sign-up)
- ✅ Clé API OpenAI GPT-4 (https://platform.openai.com/api-keys)
- ✅ Compte GitHub (optionnel, pour versioning)

### Installations locales
- Node.js 18+ et npm
- Wrangler CLI : `npm install -g wrangler`

---

## 🔑 ÉTAPE 1 : Configuration Cloudflare

### 1.1 Authentification Wrangler

```bash
cd /home/user/webapp

# Login Cloudflare
npx wrangler login

# Vérifier l'authentification
npx wrangler whoami
```

### 1.2 Créer la base de données D1 Production

```bash
# Créer la database
npx wrangler d1 create tibok-medical-db

# Output attendu:
# ✅ Successfully created DB 'tibok-medical-db'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "tibok-medical-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT** : Copier le `database_id` et l'insérer dans `wrangler.jsonc` :

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "tibok-medical-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // ← REMPLACER ICI
    }
  ]
}
```

### 1.3 Appliquer les migrations en production

```bash
# Appliquer le schéma
npx wrangler d1 migrations apply tibok-medical-db

# Vérifier
npx wrangler d1 execute tibok-medical-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 1.4 Insérer les données de seed (optionnel)

```bash
# Importer les données de test
npx wrangler d1 execute tibok-medical-db --file=./seed.sql
```

---

## 🔐 ÉTAPE 2 : Configuration des Secrets

### 2.1 Configurer la clé OpenAI

```bash
# Configurer le secret OpenAI
npx wrangler secret put OPENAI_API_KEY --project-name tibok-medical-evaluation

# Entrer votre clé quand demandé (commence par sk-...)
```

### 2.2 Vérifier les secrets

```bash
npx wrangler secret list --project-name tibok-medical-evaluation

# Output attendu:
# [
#   {
#     "name": "OPENAI_API_KEY",
#     "type": "secret_text"
#   }
# ]
```

---

## 🏗️ ÉTAPE 3 : Build et Déploiement

### 3.1 Build du projet

```bash
cd /home/user/webapp

# Build production
npm run build

# Vérifier le dossier dist/
ls -la dist/

# Fichiers attendus:
# - _worker.js (bundle Cloudflare Worker)
# - _routes.json (configuration routage)
# - public/ (assets statiques)
```

### 3.2 Créer le projet Cloudflare Pages

```bash
# Créer le projet (première fois uniquement)
npx wrangler pages project create tibok-medical-evaluation \
  --production-branch main \
  --compatibility-date 2025-11-25

# Output attendu:
# ✨ Successfully created the 'tibok-medical-evaluation' project.
```

### 3.3 Déployer en production

```bash
# Déploiement initial
npx wrangler pages deploy dist --project-name tibok-medical-evaluation

# Output attendu:
# ✨ Deployment complete!
# 
# URL: https://tibok-medical-evaluation.pages.dev
# Branch: main
```

### 3.4 URLs de déploiement

Après le déploiement, vous recevrez :

**URL Production** :
```
https://tibok-medical-evaluation.pages.dev
```

**URL Preview (par branch)** :
```
https://main.tibok-medical-evaluation.pages.dev
```

---

## ✅ ÉTAPE 4 : Vérification Post-Déploiement

### 4.1 Test des endpoints

```bash
PROD_URL="https://tibok-medical-evaluation.pages.dev"

# Health check
curl "$PROD_URL/api/health"

# Stats
curl "$PROD_URL/api/admin/stats"

# QCM random
curl "$PROD_URL/api/generate/qcm/random?count=2"
```

### 4.2 Test du dashboard

Ouvrir dans le navigateur :
```
https://tibok-medical-evaluation.pages.dev
```

Vérifier :
- ✅ Dashboard affiche correctement
- ✅ Statistiques chargent
- ✅ Onglets fonctionnent
- ✅ Génération de QCM fonctionne (avec clé OpenAI)

---

## 🔄 ÉTAPE 5 : Mises à Jour Continues

### 5.1 Workflow de déploiement

```bash
# 1. Faire les modifications
vim src/index.tsx

# 2. Tester localement
npm run build
pm2 restart tibok-medical-evaluation

# 3. Commit git
git add .
git commit -m "Description des changements"

# 4. Déployer en production
npm run deploy
# OU
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

### 5.2 Rollback en cas de problème

```bash
# Lister les déploiements
npx wrangler pages deployment list --project-name tibok-medical-evaluation

# Rollback vers un déploiement précédent
npx wrangler pages deployment tail --project-name tibok-medical-evaluation <deployment-id>
```

---

## 🌐 ÉTAPE 6 : Configuration Domaine Personnalisé (Optionnel)

### 6.1 Ajouter un domaine custom

```bash
# Exemple: evaluation.tibok.mu
npx wrangler pages domain add evaluation.tibok.mu \
  --project-name tibok-medical-evaluation
```

### 6.2 Configurer DNS

Ajouter chez votre registrar DNS :

**Type CNAME** :
```
evaluation.tibok.mu → tibok-medical-evaluation.pages.dev
```

---

## 📊 ÉTAPE 7 : Monitoring et Logs

### 7.1 Consulter les logs

```bash
# Logs en temps réel
npx wrangler pages deployment tail --project-name tibok-medical-evaluation

# Logs d'une requête spécifique
npx wrangler tail --project-name tibok-medical-evaluation
```

### 7.2 Cloudflare Dashboard

Accéder à : https://dash.cloudflare.com

Naviguer vers :
- **Workers & Pages** → tibok-medical-evaluation
- **Analytics** : voir les métriques
- **Logs** : voir les erreurs
- **Settings** : gérer les variables et secrets

---

## 💰 ÉTAPE 8 : Coûts et Limites

### Cloudflare Pages (Gratuit)
- ✅ 500 builds/mois
- ✅ Bande passante illimitée
- ✅ 100 déploiements simultanés
- ✅ CDN global

### Cloudflare D1 (Gratuit)
- ✅ 5 GB stockage
- ✅ 100,000 lectures/jour
- ✅ 10,000 écritures/jour

### OpenAI GPT-4 Turbo (Payant)
- 💵 $0.01 / 1K tokens (input)
- 💵 $0.03 / 1K tokens (output)
- 💵 Estimation mensuelle : $50-100 (selon usage)

**Recommandation** : Configurer une alerte budget OpenAI à $100/mois.

---

## 🔐 ÉTAPE 9 : Sécurité Production

### 9.1 Variables d'environnement

```bash
# Lister les variables
npx wrangler pages var list --project-name tibok-medical-evaluation

# Ajouter une variable
npx wrangler pages var set AI_PROVIDER=openai \
  --project-name tibok-medical-evaluation
```

### 9.2 Authentification (À implémenter)

Pour sécuriser le dashboard admin :

1. **Option 1** : Cloudflare Access (gratuit jusqu'à 50 utilisateurs)
2. **Option 2** : JWT tokens + Hono JWT middleware
3. **Option 3** : Basic Auth via Cloudflare

### 9.3 Rate Limiting

Ajouter dans `wrangler.jsonc` :

```jsonc
{
  "limits": {
    "cpu_ms": 10000
  }
}
```

---

## 🚨 Troubleshooting

### Erreur : "Database not found"

```bash
# Vérifier le database_id dans wrangler.jsonc
# Lister les databases
npx wrangler d1 list

# Recréer si nécessaire
npx wrangler d1 create tibok-medical-db
```

### Erreur : "OpenAI API key not found"

```bash
# Re-configurer le secret
npx wrangler secret put OPENAI_API_KEY --project-name tibok-medical-evaluation

# Vérifier
npx wrangler secret list --project-name tibok-medical-evaluation
```

### Erreur 500 sur /api/generate/*

- Vérifier les logs : `npx wrangler pages deployment tail`
- Vérifier le budget OpenAI : https://platform.openai.com/usage
- Tester avec curl pour voir l'erreur exacte

### Build failed

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📋 Checklist Pré-Déploiement

Avant de déployer en production, vérifier :

- [ ] Base de données D1 créée et migrée
- [ ] Clé OpenAI configurée et testée
- [ ] Build réussi sans erreurs
- [ ] Tests locaux OK (PM2)
- [ ] Documentation à jour (README.md)
- [ ] Git commit effectué
- [ ] Secrets production configurés
- [ ] Monitoring configuré
- [ ] Budget OpenAI surveillé

---

## 📞 Support Post-Déploiement

### Cloudflare Support
- Community : https://community.cloudflare.com
- Discord : https://discord.gg/cloudflaredev
- Docs : https://developers.cloudflare.com

### OpenAI Support
- Help : https://help.openai.com
- Status : https://status.openai.com
- Forum : https://community.openai.com

---

## 🎯 URLs Finales Production

Une fois déployé, sauvegarder ces URLs :

```
Production Dashboard:
https://tibok-medical-evaluation.pages.dev

API Health:
https://tibok-medical-evaluation.pages.dev/api/health

Admin Stats:
https://tibok-medical-evaluation.pages.dev/api/admin/stats

Cloudflare Dashboard:
https://dash.cloudflare.com → Workers & Pages → tibok-medical-evaluation
```

---

**🚀 Bon déploiement !**

Le système est maintenant prêt à être déployé en production sur Cloudflare Pages avec scaling automatique global.
