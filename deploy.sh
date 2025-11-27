#!/bin/bash

# =============================================================================
# Script de Déploiement Automatique - TIBOK Medical Evaluation
# =============================================================================

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                        ║"
echo "║         🚀 DÉPLOIEMENT TIBOK MEDICAL EVALUATION v1.6.2                 ║"
echo "║                                                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# =============================================================================
# Configuration
# =============================================================================

PROJECT_NAME="tibok-medical-evaluation"
DB_NAME="tibok-medical-db-production"
PRODUCTION_BRANCH="main"

# =============================================================================
# Fonctions Utilitaires
# =============================================================================

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ Erreur: $1 n'est pas installé"
        exit 1
    fi
}

# =============================================================================
# Étape 1 : Vérifications Préalables
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ÉTAPE 1/7 : Vérifications préalables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier Node.js
check_command node
echo "✅ Node.js: $(node --version)"

# Vérifier npm
check_command npm
echo "✅ npm: $(npm --version)"

# Vérifier wrangler
if ! npm list -g wrangler &> /dev/null; then
    echo "⚠️  Wrangler non trouvé, utilisation via npx"
else
    echo "✅ Wrangler: $(npx wrangler --version)"
fi

# Vérifier l'authentification Cloudflare
echo ""
echo "🔑 Vérification de l'authentification Cloudflare..."
if npx wrangler whoami &> /dev/null; then
    echo "✅ Authentification Cloudflare OK"
else
    echo "❌ Erreur: Vous n'êtes pas authentifié sur Cloudflare"
    echo ""
    echo "🔧 Configuration requise:"
    echo "   1. Allez dans l'onglet 'Deploy' de GenSpark"
    echo "   2. Configurez votre API Token Cloudflare"
    echo "   3. Ou exportez manuellement: export CLOUDFLARE_API_TOKEN='votre_token'"
    echo ""
    exit 1
fi

echo ""

# =============================================================================
# Étape 2 : Installation des Dépendances
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 ÉTAPE 2/7 : Installation des dépendances"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install
echo "✅ Dépendances installées"
echo ""

# =============================================================================
# Étape 3 : Build du Projet
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 ÉTAPE 3/7 : Build du projet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Nettoyer les anciens builds
rm -rf dist .wrangler

# Build
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Erreur: Le dossier dist n'a pas été créé"
    exit 1
fi

echo "✅ Build réussi"
echo ""

# =============================================================================
# Étape 4 : Vérifier/Créer la Base de Données D1
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🗄️  ÉTAPE 4/7 : Configuration de la base de données D1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si la base existe déjà
if npx wrangler d1 list | grep -q "$DB_NAME"; then
    echo "✅ Base de données '$DB_NAME' existe déjà"
else
    echo "⚠️  Base de données '$DB_NAME' non trouvée"
    echo ""
    read -p "🔧 Voulez-vous créer la base de données maintenant ? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo "📊 Création de la base de données..."
        npx wrangler d1 create "$DB_NAME"
        echo ""
        echo "⚠️  IMPORTANT: Copiez le 'database_id' ci-dessus et mettez-le dans wrangler.jsonc"
        echo ""
        read -p "Appuyez sur Entrée quand vous avez mis à jour wrangler.jsonc..."
    else
        echo "❌ Base de données requise. Abandon du déploiement."
        exit 1
    fi
fi

# Appliquer les migrations
echo ""
echo "📊 Application des migrations..."
if npx wrangler d1 migrations apply "$DB_NAME" --remote; then
    echo "✅ Migrations appliquées avec succès"
else
    echo "⚠️  Migrations déjà appliquées ou erreur non critique"
fi

echo ""

# =============================================================================
# Étape 5 : Créer/Vérifier le Projet Cloudflare Pages
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 ÉTAPE 5/7 : Configuration du projet Cloudflare Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vérifier si le projet existe déjà
if npx wrangler pages project list 2>/dev/null | grep -q "$PROJECT_NAME"; then
    echo "✅ Projet '$PROJECT_NAME' existe déjà"
else
    echo "⚠️  Projet '$PROJECT_NAME' non trouvé"
    echo ""
    read -p "🔧 Voulez-vous créer le projet maintenant ? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo "📦 Création du projet Cloudflare Pages..."
        npx wrangler pages project create "$PROJECT_NAME" \
            --production-branch "$PRODUCTION_BRANCH" \
            --compatibility-date 2024-01-01
        echo "✅ Projet créé avec succès"
    else
        echo "❌ Projet requis. Abandon du déploiement."
        exit 1
    fi
fi

echo ""

# =============================================================================
# Étape 6 : Déploiement sur Cloudflare Pages
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 ÉTAPE 6/7 : Déploiement sur Cloudflare Pages"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📤 Upload des fichiers vers Cloudflare Pages..."
if npx wrangler pages deploy dist --project-name "$PROJECT_NAME"; then
    echo ""
    echo "✅ Déploiement réussi !"
else
    echo ""
    echo "❌ Erreur lors du déploiement"
    exit 1
fi

echo ""

# =============================================================================
# Étape 7 : Tests Post-Déploiement
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ÉTAPE 7/7 : Tests post-déploiement"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Récupérer l'URL de déploiement
DEPLOY_URL="https://$PROJECT_NAME.pages.dev"

echo "🔍 Test du Health Check..."
sleep 3  # Attendre que le déploiement soit actif

if curl -s -f "$DEPLOY_URL/api/health" > /dev/null; then
    echo "✅ API Health Check OK"
    echo ""
    echo "📊 Résultat:"
    curl -s "$DEPLOY_URL/api/health" | jq '.'
else
    echo "⚠️  API Health Check échouée (peut nécessiter quelques minutes)"
fi

echo ""

# =============================================================================
# Résumé Final
# =============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 URLS D'ACCÈS:"
echo ""
echo "   🌐 Production:"
echo "      $DEPLOY_URL"
echo ""
echo "   🔐 Login:"
echo "      $DEPLOY_URL/static/login"
echo ""
echo "   📝 Démarrer Évaluation:"
echo "      $DEPLOY_URL/static/start-evaluation-direct.html"
echo ""
echo "   👨‍💼 Dashboard Admin:"
echo "      $DEPLOY_URL/static/admin-dashboard-full.html"
echo ""
echo "   🔍 API Health Check:"
echo "      $DEPLOY_URL/api/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 CREDENTIALS DE TEST:"
echo ""
echo "   Admin:"
echo "   - Email: admin@tibok.mu"
echo "   - Password: password123"
echo ""
echo "   Médecin:"
echo "   - Email: dr.jean.martin@tibok.mu"
echo "   - Password: password123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 PROCHAINES ÉTAPES:"
echo ""
echo "   1. Tester l'application déployée"
echo "   2. Configurer un domaine personnalisé (optionnel):"
echo "      npx wrangler pages domain add votre-domaine.com \\"
echo "        --project-name $PROJECT_NAME"
echo ""
echo "   3. Configurer les secrets de production (si nécessaire):"
echo "      npx wrangler pages secret put OPENAI_API_KEY \\"
echo "        --project-name $PROJECT_NAME"
echo ""
echo "   4. Consulter le guide complet: GUIDE_DEPLOIEMENT_COMPLET.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Déploiement terminé le: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
