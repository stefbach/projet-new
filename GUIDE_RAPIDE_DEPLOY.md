# ⚡ Guide Rapide : GitHub + Déploiement (5 minutes)

## 🎯 Objectif

Déployer votre projet TIBOK Medical Evaluation sur internet avec déploiement automatique depuis GitHub.

---

## ✅ ÉTAPE 1 : Vérifier GitHub (Déjà fait !)

Votre code est déjà sur GitHub :
```
🔗 https://github.com/stefbach/projet-new
✅ 76 fichiers
✅ Documentation complète
```

---

## 🚀 ÉTAPE 2 : Obtenir votre Token Cloudflare (2 minutes)

### Option A : Via GenSpark (Le plus simple)

```
1. Ouvrez GenSpark
2. Allez dans l'onglet "Deploy"
3. Section "Cloudflare API Key Setup"
4. Suivez les instructions
```

### Option B : Manuellement

```
1. Allez sur : https://dash.cloudflare.com/profile/api-tokens
2. Cliquez "Create Token"
3. Choisissez "Edit Cloudflare Workers"
4. Cliquez "Continue to summary"
5. Cliquez "Create Token"
6. 📋 COPIEZ le token (vous ne le reverrez plus !)
```

---

## 📦 ÉTAPE 3 : Premier Déploiement (3 minutes)

### Dans le Terminal

```bash
cd /home/user/webapp
./deploy.sh
```

### Ce qui va se passer :

```
✅ Installation des dépendances...
✅ Build du projet...
✅ Création de la base de données D1...
✅ Déploiement sur Cloudflare Pages...

🎉 SUCCÈS !

📍 URL Production : https://tibok-medical-evaluation.pages.dev
```

---

## 🔄 ÉTAPE 4 : Activer le Déploiement Automatique (5 minutes)

### 4.1 Créer le Fichier Workflow

```bash
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
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
      
      - name: Install
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tibok-medical-evaluation
          directory: dist
EOF
```

### 4.2 Obtenir votre Account ID

```bash
npx wrangler whoami
```

Exemple de sortie :
```
Account ID: abc123def456ghi789
```

📋 **Copiez cet Account ID**

### 4.3 Ajouter les Secrets GitHub

```
1. Allez sur : https://github.com/stefbach/projet-new/settings/secrets/actions

2. Cliquez "New repository secret"

3. Ajoutez le premier secret :
   Nom : CLOUDFLARE_API_TOKEN
   Valeur : [collez votre token Cloudflare]
   → "Add secret"

4. Ajoutez le deuxième secret :
   Nom : CLOUDFLARE_ACCOUNT_ID
   Valeur : [collez votre account ID]
   → "Add secret"
```

### 4.4 Push le Workflow

```bash
git add .github/workflows/deploy.yml
git commit -m "🚀 CI/CD: Déploiement automatique"
git push origin main
```

---

## 🎉 C'EST TERMINÉ !

### Ce qui est maintenant automatique :

✅ **Push sur `main`** → Déploiement automatique en production  
✅ **Pull Request** → Preview automatique  
✅ **Analytics** → Monitoring en temps réel  
✅ **SSL** → HTTPS automatique  
✅ **CDN** → Disponible dans 275+ villes  

### URLs d'accès :

- 🌐 **Production** : https://tibok-medical-evaluation.pages.dev
- 🔐 **Login Admin** : https://tibok-medical-evaluation.pages.dev/static/login
- 📊 **Dashboard** : https://tibok-medical-evaluation.pages.dev/static/admin-dashboard-full.html
- 🏥 **Évaluation** : https://tibok-medical-evaluation.pages.dev/static/start-evaluation-direct.html

---

## 🔄 Workflow Quotidien

### Faire des modifications

```bash
# 1. Créer une branche
git checkout -b feature/ma-feature

# 2. Modifier les fichiers
# ... éditer ...

# 3. Commit
git add .
git commit -m "✨ Ma nouvelle fonctionnalité"

# 4. Push
git push origin feature/ma-feature

# 5. Créer une Pull Request sur GitHub
# → Preview automatique créé !
```

### Déployer en production

```bash
# 1. Merger la PR sur GitHub

# 2. C'est tout ! 🎉
# → Déploiement automatique en 2-3 minutes
```

---

## 🎨 Ajouter un Domaine Personnalisé (Optionnel)

Si vous voulez `tibok-medical.com` au lieu de `*.pages.dev` :

```bash
npx wrangler pages domain add tibok-medical.com --project-name tibok-medical-evaluation
```

Puis configurer votre DNS :
```
Type : CNAME
Nom : @
Valeur : tibok-medical-evaluation.pages.dev
```

---

## 📊 Voir les Déploiements

### Sur GitHub
```
https://github.com/stefbach/projet-new/actions
```

### Sur Cloudflare
```
https://dash.cloudflare.com → Pages → tibok-medical-evaluation
```

---

## 🆘 Problèmes Courants

### "Failed to deploy"

**Solution** : Vérifiez les secrets GitHub
```
Settings → Secrets → Actions
Vérifiez que CLOUDFLARE_API_TOKEN et CLOUDFLARE_ACCOUNT_ID sont présents
```

### "Database not found"

**Solution** : Créez la base de données
```bash
npx wrangler d1 create tibok-medical-db
# Copiez l'ID dans wrangler.jsonc
```

### "Build failed"

**Solution** : Testez le build localement
```bash
npm run build
# Si ça marche localement, c'est un problème de configuration GitHub
```

---

## 📞 Support

- 📖 Guide complet : `GUIDE_DEPLOIEMENT_COMPLET.md`
- 🔧 Documentation technique : `README.md`
- 🔗 Repository : https://github.com/stefbach/projet-new

---

## ✅ Checklist Finale

- [ ] Token Cloudflare obtenu
- [ ] Premier déploiement réussi (`./deploy.sh`)
- [ ] Workflow GitHub créé (`.github/workflows/deploy.yml`)
- [ ] Secrets GitHub configurés
- [ ] Push du workflow effectué
- [ ] Test d'un déploiement automatique
- [ ] URLs de production fonctionnelles

---

**🎉 FÉLICITATIONS !**

Votre système est maintenant :
- ✅ Déployé en production
- ✅ Synchronisé avec GitHub
- ✅ Déploiement automatique actif
- ✅ Analytics et monitoring en place
- ✅ SSL et CDN configurés

**Temps total : 10 minutes**  
**Coût : 0€**  
**Maintenance : Automatique**

---

**Version** : Guide Rapide v1.0  
**Date** : 27 novembre 2025  
**Status** : ✅ Ready to Deploy
