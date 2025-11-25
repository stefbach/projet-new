# Tibok Medical Evaluation

## 🏥 Vue d'ensemble

**Tibok Medical Evaluation** est un système complet d'évaluation des compétences médicales pour la plateforme de téléconsultation TIBOK à Maurice. Le système utilise l'intelligence artificielle (OpenAI GPT-4) pour générer du contenu médical et auditer les consultations en temps réel.

## 🎯 Objectifs

- **Évaluation continue** des médecins via QCM, cas cliniques et audits IA
- **Génération infinie** de contenu médical basé sur les guidelines OMS/WHO
- **Audit automatique** des téléconsultations avec détection des red flags
- **Scoring T-MCQ** (Tibok Medical Quality Composite) pour mesurer la qualité
- **Conformité** aux standards Medical Council of Mauritius et WHO

## 📊 Fonctionnalités actuellement complétées

### ✅ Infrastructure technique
- Backend Hono + TypeScript déployable sur Cloudflare Pages
- Base de données Cloudflare D1 (SQLite distribué)
- Intégration OpenAI GPT-4 pour génération IA
- Dashboard admin complet avec visualisations

### ✅ Système d'évaluation
- **QCM médicaux** : 6 QCM de base + génération IA illimitée
- **Cas cliniques** : 1 cas de base + génération IA illimitée
- **Scoring T-MCQ** : Algorithme de calcul pondéré
- **Audit IA** : Analyse automatique des consultations

### ✅ Base de données
- Schéma complet avec 9 tables
- Index optimisés pour performance
- Données de test (3 médecins, 6 QCM, 1 cas clinique)

## 🚀 URLs et accès

### URLs actuelles
- **Dashboard Admin** : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai
- **API Health Check** : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/health
- **API Base** : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api

### Endpoints API disponibles

#### Génération de contenu
- `POST /api/generate/qcm` - Générer des QCM via IA
- `GET /api/generate/qcm/random` - Récupérer des QCM aléatoires
- `POST /api/generate/clinical-case` - Générer un cas clinique via IA
- `GET /api/generate/clinical-case/random` - Récupérer un cas clinique aléatoire

#### Évaluation
- `POST /api/evaluate/consultation` - Auditer une téléconsultation
- `POST /api/evaluate/qcm` - Enregistrer une réponse QCM
- `POST /api/evaluate/clinical-case` - Évaluer une tentative de cas clinique
- `GET /api/evaluate/doctor/:doctorId/stats` - Statistiques d'un médecin

#### Administration
- `GET /api/admin/doctors` - Liste des médecins
- `GET /api/admin/doctor/:doctorId` - Détails d'un médecin
- `GET /api/admin/audits` - Liste des audits
- `GET /api/admin/alerts` - Liste des alertes
- `GET /api/admin/stats` - Statistiques globales
- `PUT /api/admin/alert/:alertId/resolve` - Résoudre une alerte
- `POST /api/admin/doctor/:doctorId/evaluate` - Créer une évaluation T-MCQ

## 🏗️ Architecture de données

### Tables principales

#### `doctors`
Informations des médecins inscrits
- ID, email, nom, spécialité, licence, statut

#### `doctors_evaluations`
Évaluations T-MCQ des médecins
- Scores QCM, cas cliniques, audit IA, T-MCQ total, statut

#### `consultations_audit`
Audits IA des téléconsultations
- Transcript, scores détaillés, red flags, sévérité

#### `alerts_doctors`
Alertes pour performances insuffisantes
- Type (score faible, red flag manqué, non-conformité)
- Sévérité, statut résolu/non résolu

#### `generated_qcm`
QCM générés par IA
- Topic, difficulté, question, options, source WHO/OMS

#### `clinical_cases`
Cas cliniques générés par IA
- Spécialité, profil patient, diagnostic, prescription WHO EML

## 📈 Système de scoring T-MCQ

### Composants du score (pondération)
- **Compétence clinique** : 40% (QCM + cas cliniques)
- **Sécurité (Red Flags)** : 30% (détection IA)
- **Prescription & guidelines** : 15% (conformité WHO EML)
- **Dossier médical** : 10% (qualité documentation)
- **Communication** : 5% (clarté, empathie)

### Seuils de décision
- **≥ 85%** : Apte (pratique autonome)
- **70-84%** : Supervision (surveillance nécessaire)
- **< 70%** : Formation requise (mise à niveau obligatoire)

## 🔧 Technologies utilisées

### Backend
- **Hono** : Framework web léger pour Cloudflare Workers
- **TypeScript** : Typage strict et sécurité
- **Cloudflare D1** : Base de données SQLite distribuée
- **OpenAI GPT-4** : IA générative pour contenu médical

### Frontend
- **HTML/CSS/JavaScript** : Dashboard admin
- **TailwindCSS** : Framework CSS
- **Chart.js** : Graphiques et visualisations
- **Axios** : Client HTTP

### Infrastructure
- **Cloudflare Pages** : Déploiement edge global
- **PM2** : Process manager pour développement
- **Wrangler** : CLI Cloudflare

## 🚀 Déploiement

### Développement local (sandbox actuel)
```bash
# Build
npm run build

# Démarrer avec PM2
pm2 start ecosystem.config.cjs

# Vérifier status
pm2 list

# Logs
pm2 logs tibok-medical-evaluation --nostream
```

### Production Cloudflare Pages

#### 1. Configuration des clés API
```bash
# OpenAI API Key (OBLIGATOIRE)
npx wrangler secret put OPENAI_API_KEY

# Valeur : votre clé OpenAI GPT-4
```

#### 2. Créer la base de données production
```bash
# Créer D1 database
npx wrangler d1 create tibok-medical-db

# Copier le database_id dans wrangler.jsonc
# Remplacer "REPLACE_WITH_ACTUAL_DB_ID_AFTER_CREATION"

# Appliquer les migrations
npx wrangler d1 migrations apply tibok-medical-db
```

#### 3. Déployer
```bash
# Déploiement production
npm run deploy

# OU avec nom de projet spécifique
npx wrangler pages deploy dist --project-name tibok-medical-evaluation
```

## 📝 Données de test disponibles

### Médecins
- **Dr. Jean Martin** : Médecine Générale (doc-001)
- **Dr. Marie Dubois** : Cardiologie (doc-002)
- **Dr. Paul Leroy** : Endocrinologie (doc-003)

### QCM (6 disponibles)
- Hypertension (WHO 2021)
- Diabète Type 2 (IDF 2024)
- Prescription (WHO EML 2023)
- Téléconsultation (WHO Digital Health 2019)

### Cas cliniques (1 disponible)
- HTA non contrôlée chez patient diabétique

## 🎓 Guidelines médicales de référence

### Sources officielles utilisées
- **WHO Hypertension Guidelines 2021**
- **WHO Essential Medicines List (EML) 2023**
- **WHO Digital Health Guidelines 2019**
- **IDF Diabetes Atlas 2024**
- **GINA Asthma Guidelines 2024**
- **Medical Council of Mauritius Code of Practice 2023**

## ⚠️ Fonctionnalités non encore implémentées

### 🔴 Haute priorité
- [ ] Génération des **144 QCM supplémentaires** (actuellement 6/150)
- [ ] Génération des **29 cas cliniques supplémentaires** (actuellement 1/30)
- [ ] Système d'authentification médecins
- [ ] Interface patient pour évaluation des médecins

### 🟡 Moyenne priorité
- [ ] Export PDF des rapports d'évaluation
- [ ] Notifications email automatiques (alertes)
- [ ] Tableau de bord médecin (vue personnelle)
- [ ] Historique détaillé des consultations auditées
- [ ] Workflow n8n pour audit quotidien automatique

### 🟢 Basse priorité
- [ ] Multi-langue (Français, Anglais, Créole)
- [ ] Module de formation intégré
- [ ] Système de réclamation médecins
- [ ] Analytics avancés et prédictions IA

## 📋 Prochaines étapes recommandées

1. **Générer le contenu médical complet**
   - Utiliser l'endpoint `/api/generate/qcm` pour créer 144 QCM supplémentaires
   - Utiliser l'endpoint `/api/generate/clinical-case` pour 29 cas cliniques
   - Couvrir toutes les spécialités : cardio, endocrinologie, infectiologie tropicale, dermatologie, etc.

2. **Implémenter l'authentification**
   - Système de login médecins avec JWT
   - Rôles : admin, médecin, auditeur
   - Integration avec système TIBOK existant

3. **Automatiser les audits**
   - Workflow quotidien automatique
   - Scoring T-MCQ hebdomadaire par médecin
   - Alertes automatiques si score < 70%

4. **Documentation clinique**
   - Clinical Governance Policy complète
   - Procédures de supervision
   - Guide médecin

## 📞 Support technique

### Structure du projet
```
webapp/
├── src/
│   ├── index.tsx              # Application Hono principale
│   ├── types/medical.ts       # Types TypeScript
│   ├── lib/
│   │   ├── openai.ts          # Service OpenAI GPT-4
│   │   └── scoring.ts         # Algorithme T-MCQ
│   └── routes/
│       ├── generate.ts        # Génération contenu IA
│       ├── evaluate.ts        # Évaluation et audits
│       └── admin.ts           # Routes administration
├── public/static/
│   └── admin-dashboard.js     # Frontend dashboard
├── migrations/
│   └── 0001_initial_schema.sql # Schéma D1
├── wrangler.jsonc             # Config Cloudflare
├── package.json
└── README.md
```

## 🔐 Sécurité

### Données sensibles
- Clé OpenAI stockée comme secret Cloudflare (jamais en clair)
- Base de données D1 isolée par environnement
- Pas d'exposition des transcripts de consultation

### Conformité
- RGPD : Anonymisation des données patients
- Medical Council Mauritius : Respect du code de pratique
- WHO : Application stricte des guidelines

## 📊 Statistiques actuelles

- **Médecins** : 3
- **QCM disponibles** : 6
- **Cas cliniques** : 1
- **Audits effectués** : 0
- **Alertes actives** : 0
- **Score T-MCQ moyen** : - (pas encore d'évaluations)

## 🎯 Vision et objectifs

Ce système vise à garantir la qualité des soins en téléconsultation à Maurice en :
- Évaluant objectivement les compétences médicales
- Détectant précocement les lacunes de formation
- Assurant la conformité aux standards internationaux OMS
- Protégeant la sécurité des patients via détection red flags

---

**Dernière mise à jour** : 2025-11-25  
**Version** : 1.0.0  
**Statut** : ✅ Opérationnel (développement)  
**Plateforme** : Cloudflare Pages + Cloudflare D1
