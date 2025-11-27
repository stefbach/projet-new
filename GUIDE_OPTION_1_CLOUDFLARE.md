# 🚀 Option 1 : Déployer sur Cloudflare Pages (Guide Complet)

## 📋 Vue d'Ensemble

Ce guide vous accompagne **étape par étape** pour déployer votre application TIBOK Medical Evaluation sur Cloudflare Pages en **5 minutes**.

---

## ✅ Pourquoi l'Option 1 ?

- ✅ **Code 100% compatible** (aucune modification nécessaire)
- ✅ **5 minutes** de déploiement
- ✅ **0€** de coût (hosting + base de données + CDN)
- ✅ **Base de données D1** intégrée et fonctionnelle
- ✅ **Script automatique** prêt à l'emploi
- ✅ **Toutes les fonctionnalités** marchent immédiatement

---

## 📍 ÉTAPE 1 : Obtenir votre Token Cloudflare (2 minutes)

### Méthode A : Via le Dashboard Cloudflare (Recommandé)

#### 1.1 Aller sur la page des tokens

```
🔗 https://dash.cloudflare.com/profile/api-tokens
```

**Ou suivez ce chemin :**
1. Allez sur https://dash.cloudflare.com
2. Cliquez sur votre profil (en haut à droite)
3. Sélectionnez **"API Tokens"**

---

#### 1.2 Créer un nouveau token

1. Cliquez sur le bouton **"Create Token"** (bleu)

2. Cherchez le template **"Edit Cloudflare Workers"**
   - Cliquez sur **"Use template"** à côté

3. **Configuration du token** :
   
   **Nom du token** (facultatif) :
   ```
   TIBOK Medical Evaluation Deployment
   ```

   **Permissions** (déjà configurées par le template) :
   ```
   ✅ Account → Cloudflare Pages → Edit
   ✅ Account → D1 → Edit
   ✅ Zone → DNS → Edit (optionnel, pour domaine personnalisé)
   ```

4. **Ressources du compte** :
   - Laissez : "All accounts"
   - Ou sélectionnez votre compte spécifique

5. **Durée de validité** :
   - Laissez par défaut ou choisissez une durée

6. Cliquez sur **"Continue to summary"**

7. Vérifiez les permissions :
   ```
   ✅ Account - Cloudflare Pages:Edit
   ✅ Account - D1:Edit
   ```

8. Cliquez sur **"Create Token"**

---

#### 1.3 Copier le token

**⚠️ IMPORTANT : Vous ne verrez ce token qu'UNE SEULE FOIS !**

```
┌─────────────────────────────────────────────────────────┐
│  Your token:                                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │ abc123def456ghi789jkl012mno345pqr678stu901vwx234  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  📋 Copy    [Hide]                                      │
└─────────────────────────────────────────────────────────┘
```

1. Cliquez sur **"Copy"** 
2. **Collez-le immédiatement** dans un fichier texte temporaire
3. **Gardez cette fenêtre ouverte** jusqu'à l'étape 2

---

### Méthode B : Via GenSpark (Alternative)

Si vous utilisez GenSpark :

1. Onglet **"Deploy"** dans GenSpark
2. Section **"Cloudflare API Key Setup"**
3. Suivez les instructions affichées
4. Le token sera automatiquement configuré

---

## 📍 ÉTAPE 2 : Déployer votre Application (3 minutes)

### 2.1 Préparer l'environnement

**Dans votre terminal/shell :**

```bash
# Aller dans le répertoire du projet
cd /home/user/webapp

# Vérifier que tout est prêt
ls -la

# Vous devriez voir :
# - deploy.sh (script de déploiement)
# - package.json
# - src/
# - wrangler.jsonc
# etc.
```

---

### 2.2 Configurer le token Cloudflare

**Créer le fichier `.dev.vars` :**

```bash
# Créer le fichier avec votre token
cat > .dev.vars << 'EOF'
CLOUDFLARE_API_TOKEN=VOTRE_TOKEN_ICI
EOF
```

**Ou éditez manuellement :**

```bash
nano .dev.vars
```

Puis collez :
```
CLOUDFLARE_API_TOKEN=abc123def456ghi789jkl012mno345pqr678stu901vwx234
```

**Sauvegardez** :
- `Ctrl + O` puis `Enter` (pour sauvegarder)
- `Ctrl + X` (pour quitter)

---

### 2.3 Exécuter le déploiement

**Lancer le script automatique :**

```bash
./deploy.sh
```

**Ou si vous avez une erreur de permission :**

```bash
chmod +x deploy.sh
./deploy.sh
```

---

### 2.4 Ce qui va se passer

Le script va automatiquement :

```
┌─────────────────────────────────────────────┐
│ 1️⃣  Vérifier les prérequis                 │
│     ✅ Node.js installé                     │
│     ✅ npm disponible                       │
│     ✅ wrangler CLI prêt                    │
│                                             │
│ 2️⃣  Installer les dépendances              │
│     ⏳ npm install...                       │
│     ✅ Dépendances installées               │
│                                             │
│ 3️⃣  Builder le projet                      │
│     ⏳ npm run build...                     │
│     ✅ Build réussi (dist/ créé)            │
│                                             │
│ 4️⃣  Créer la base de données D1            │
│     ⏳ Création de tibok-medical-db...      │
│     ✅ Base D1 créée                        │
│                                             │
│ 5️⃣  Appliquer les migrations               │
│     ⏳ Migrations SQL...                    │
│     ✅ 5 migrations appliquées              │
│                                             │
│ 6️⃣  Créer le projet Cloudflare Pages       │
│     ⏳ Création du projet...                │
│     ✅ Projet créé                          │
│                                             │
│ 7️⃣  Déployer sur Cloudflare                │
│     ⏳ Upload des fichiers...               │
│     ✅ Déploiement réussi                   │
│                                             │
│ 8️⃣  Tester le déploiement                  │
│     ⏳ Test API /health...                  │
│     ✅ API fonctionnelle                    │
└─────────────────────────────────────────────┘
```

**Durée totale : 3-5 minutes**

---

### 2.5 Résultat final

À la fin, vous verrez :

```
╔════════════════════════════════════════════════╗
║                                                ║
║  ✅ DÉPLOIEMENT RÉUSSI !                       ║
║                                                ║
╚════════════════════════════════════════════════╝

📍 URL de production :
   https://tibok-medical-evaluation.pages.dev

🔗 Liens utiles :
   • Dashboard Admin : https://tibok-medical-evaluation.pages.dev/static/login
   • API Health : https://tibok-medical-evaluation.pages.dev/api/health
   • Évaluation : https://tibok-medical-evaluation.pages.dev/static/start-evaluation-direct.html

🔑 Comptes de test :
   • Admin : admin@tibok.mu / password123
   • Docteur : dr.jean.martin@tibok.mu / password123

✅ Base de données D1 opérationnelle
✅ Toutes les API fonctionnelles
✅ Interface complète accessible
```

---

## 📍 ÉTAPE 3 : Tester votre Application (1 minute)

### 3.1 Tester l'API Health

```bash
curl https://tibok-medical-evaluation.pages.dev/api/health
```

**Résultat attendu :**
```json
{
  "status": "ok",
  "message": "API is running",
  "database": "connected",
  "timestamp": "2025-11-27T22:30:00.000Z"
}
```

---

### 3.2 Tester le Login Admin

**Dans votre navigateur :**

```
https://tibok-medical-evaluation.pages.dev/static/login
```

**Connexion :**
- Email : `admin@tibok.mu`
- Mot de passe : `password123`

**✅ Vous devriez voir le Dashboard Admin complet**

---

### 3.3 Tester une Évaluation

```
https://tibok-medical-evaluation.pages.dev/static/start-evaluation-direct.html
```

**Connexion médecin :**
- Email : `dr.jean.martin@tibok.mu`
- Mot de passe : `password123`

**✅ L'évaluation devrait démarrer avec QCM et cas cliniques**

---

## 🎉 C'EST TERMINÉ !

Votre application est maintenant **100% fonctionnelle** sur Cloudflare Pages !

---

## 📍 ÉTAPE 4 (OPTIONNELLE) : Supprimer Vercel

Si vous avez déployé sur Vercel et voulez le supprimer :

### 4.1 Aller sur le Dashboard Vercel

```
https://vercel.com/dashboard
```

### 4.2 Trouver votre projet

- Cherchez **"projet-new"** dans la liste

### 4.3 Supprimer le projet

1. Cliquez sur le projet
2. **Settings** (en haut à droite)
3. **General** (menu de gauche)
4. Scrollez tout en bas
5. Section **"Delete Project"**
6. Cliquez sur **"Delete"**
7. Tapez le nom du projet pour confirmer : `projet-new`
8. Cliquez sur **"Delete"**

**✅ Projet Vercel supprimé**

---

### 4.4 Déconnecter de GitHub (optionnel)

Si vous voulez supprimer le webhook Vercel :

```
1. GitHub → https://github.com/stefbach/projet-new/settings/hooks
2. Trouvez le webhook Vercel
3. Cliquez sur "Delete"
4. Confirmez
```

---

## 📍 ÉTAPE 5 (OPTIONNELLE) : Domaine Personnalisé

Si vous voulez utiliser votre propre domaine (ex: `tibok-medical.com`)

### 5.1 Ajouter le domaine

```bash
cd /home/user/webapp

npx wrangler pages domain add tibok-medical.com --project-name tibok-medical-evaluation
```

---

### 5.2 Configurer le DNS

**Si votre domaine est sur Cloudflare :**
- ✅ Configuration automatique !
- Cloudflare configure tout seul

**Si votre domaine est ailleurs :**

Ajoutez un enregistrement CNAME :
```
Type : CNAME
Nom : @
Valeur : tibok-medical-evaluation.pages.dev
TTL : Auto
```

**Attendez 5-60 minutes** pour la propagation DNS.

---

### 5.3 Vérifier le domaine

```bash
# Test DNS
dig tibok-medical.com

# Test HTTPS
curl https://tibok-medical.com/api/health
```

**✅ Votre domaine personnalisé est actif !**

---

## 🎯 Récapitulatif des 5 Étapes

```
ÉTAPE 1 : Obtenir Token Cloudflare (2 min)
   → https://dash.cloudflare.com/profile/api-tokens
   → "Create Token" → "Edit Cloudflare Workers"
   → Copier le token

ÉTAPE 2 : Déployer l'Application (3 min)
   → cd /home/user/webapp
   → Créer .dev.vars avec le token
   → ./deploy.sh
   → Attendre la fin

ÉTAPE 3 : Tester l'Application (1 min)
   → curl https://tibok-medical-evaluation.pages.dev/api/health
   → Tester le login admin
   → Tester une évaluation

ÉTAPE 4 (OPTIONNELLE) : Supprimer Vercel
   → https://vercel.com/dashboard
   → Settings → Delete Project

ÉTAPE 5 (OPTIONNELLE) : Domaine Personnalisé
   → npx wrangler pages domain add tibok-medical.com
   → Configurer DNS CNAME
```

**Durée totale : 5-10 minutes**

---

## ❓ Résolution de Problèmes

### Problème 1 : "Token invalid"

**Solution :**
```bash
# Vérifier le token dans .dev.vars
cat .dev.vars

# Recréer un nouveau token
# https://dash.cloudflare.com/profile/api-tokens
```

---

### Problème 2 : "Database not found"

**Solution :**
```bash
# Créer manuellement la base D1
npx wrangler d1 create tibok-medical-db

# Copier l'ID dans wrangler.jsonc
# Puis relancer : ./deploy.sh
```

---

### Problème 3 : "Build failed"

**Solution :**
```bash
# Tester le build localement
npm install
npm run build

# Si ça marche localement, le problème est ailleurs
```

---

### Problème 4 : "Cannot access deployment"

**Solution :**
```bash
# Attendre 1-2 minutes (propagation CDN)

# Vérifier le déploiement
npx wrangler pages deployment list --project-name tibok-medical-evaluation

# Tester l'API
curl https://tibok-medical-evaluation.pages.dev/api/health
```

---

## 📞 Besoin d'Aide ?

### Documentation Complète

- **Guide rapide** : `GUIDE_RAPIDE_DEPLOY.md`
- **Guide détaillé** : `GUIDE_DEPLOIEMENT_COMPLET.md`
- **Tous les liens** : `LIENS_IMPORTANTS.md`

### Liens Utiles

- **Repository GitHub** : https://github.com/stefbach/projet-new
- **Cloudflare Dashboard** : https://dash.cloudflare.com
- **Cloudflare Docs** : https://developers.cloudflare.com/pages/

---

## ✅ Checklist Finale

Après le déploiement, vérifiez :

- [ ] ✅ Token Cloudflare créé et copié
- [ ] ✅ Fichier `.dev.vars` créé avec le token
- [ ] ✅ Script `./deploy.sh` exécuté avec succès
- [ ] ✅ URL de production accessible
- [ ] ✅ API Health retourne `"status": "ok"`
- [ ] ✅ Login admin fonctionne
- [ ] ✅ Dashboard accessible
- [ ] ✅ Évaluation démarrable
- [ ] ✅ Base de données D1 opérationnelle
- [ ] ✅ (Optionnel) Projet Vercel supprimé
- [ ] ✅ (Optionnel) Domaine personnalisé configuré

---

## 🎉 Félicitations !

Votre application TIBOK Medical Evaluation est maintenant :

- ✅ **Déployée en production** sur Cloudflare Pages
- ✅ **100% fonctionnelle** avec base de données D1
- ✅ **Accessible mondialement** via CDN Cloudflare (275+ villes)
- ✅ **Sécurisée** avec HTTPS automatique
- ✅ **Gratuite** (0€ de coût mensuel)
- ✅ **Rapide** (déploiement en 5 minutes)

**Profitez-en ! 🚀**

---

**Version** : Guide Option 1 v1.0  
**Date** : 27 novembre 2025  
**Status** : ✅ Prêt pour déploiement
