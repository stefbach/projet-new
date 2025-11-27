# 🔗 URLs d'Accès Direct - TIBOK Medical Evaluation

## 📱 Accès Principal

### 🏠 Interface Login Unifié
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/login
```
**Description** : Page de connexion unique pour Admin et Docteurs

---

## 👨‍⚕️ Espace Médecin - Évaluations

### 🚀 Démarrer une Évaluation (Auto-login)
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html
```
**Description** : Page qui charge automatiquement l'évaluation de test

**Processus :**
1. Connexion automatique (dr.jean.martin@tibok.mu)
2. Chargement du template `eval-test-001`
3. Transformation des données (QCM + cas cliniques)
4. Redirection vers l'interface d'évaluation

---

### 📝 Passer l'Évaluation
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/take-evaluation-simple.html
```
**Description** : Interface interactive pour répondre aux questions

**Fonctionnalités :**
- ✅ Affichage des QCM avec options A/B/C/D/E
- ✅ Affichage des cas cliniques avec options A/B/C/D
- ✅ Sélection interactive via boutons radio
- ✅ Sauvegarde automatique des réponses
- ✅ Navigation Précédent/Suivant
- ✅ Timer avec compte à rebours
- ✅ Barre de progression
- ✅ Soumission finale

**Note** : Cette page nécessite des données d'évaluation en sessionStorage

---

### 📊 Voir les Résultats
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/evaluation-results.html?id=EVAL_ID
```
**Description** : Affiche les résultats détaillés d'une évaluation

**Informations affichées :**
- Score T-MCQ global (0-100%)
- Score QCM (% et nombre correct/total)
- Score Cas cliniques (% et nombre correct/total)
- Statut final (APTE/SUPERVISION/FORMATION)
- Recommandations

**Exemple :**
```
evaluation-results.html?id=eval-result-1764260018201
```

---

### 📄 Rapport Narratif Formatif
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/narrative-report.html?id=EVAL_ID
```
**Description** : Rapport formatif détaillé avec analyse des forces/faiblesses

**Contenu :**
- Informations du médecin
- Résultats numériques détaillés
- Statut et niveau de compétence
- Points forts identifiés
- Axes d'amélioration
- Plan d'action recommandé

**Exemple :**
```
narrative-report.html?id=eval-result-1764256265311
```

---

## 👨‍💼 Espace Admin

### 📊 Dashboard Admin Complet
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/admin-dashboard-full.html
```
**Description** : Dashboard administrateur avec 7 onglets

**Onglets disponibles :**
1. 📊 Statistiques globales
2. 👨‍⚕️ Gestion des médecins (CRUD)
3. 📋 Gestion des QCM (génération IA)
4. 🏥 Gestion des cas cliniques (génération IA)
5. 📝 Templates d'évaluation
6. 🔍 Audits des consultations
7. 🚨 Gestion des alertes

**Credentials Admin :**
- Email : `admin@tibok.mu`
- Mot de passe : `password123`

---

### 📊 Dashboard Admin Basique
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/basic-admin.html
```
**Description** : Version simplifiée du dashboard admin

---

## 🧪 Pages de Test

### 🔐 Test Authentification
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/test-auth.html
```
**Description** : Page de test pour l'authentification JWT

---

### 👥 Test Gestion Médecins
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/test-doctors-management.html
```
**Description** : Test des opérations CRUD sur les médecins

---

### 📝 Test Évaluation Directe
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/test-evaluation-direct.html
```
**Description** : Test rapide du flux d'évaluation

---

## 🔌 API Endpoints

### 🏥 Health Check
```
GET https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/health
```
**Response :**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T16:13:38.216Z",
  "db": "connected"
}
```

---

### 🔐 Authentification

#### Login
```
POST https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/auth/login
```
**Body :**
```json
{
  "email": "dr.jean.martin@tibok.mu",
  "password": "password123"
}
```

**Response :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "doc-001",
    "name": "Dr. Jean Martin",
    "email": "dr.jean.martin@tibok.mu"
  }
}
```

---

### 📝 Évaluations

#### Démarrer une Évaluation
```
POST https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/evaluations/start
```
**Headers :**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body :**
```json
{
  "template_id": "eval-test-001"
}
```

**Response :**
```json
{
  "success": true,
  "evaluation": {
    "id": "eval-session-1764260018201",
    "template_id": "eval-test-001",
    "name": "Évaluation Médicale Générale - Test",
    "duration_minutes": 60,
    "qcms": [...],
    "cases": [...]
  }
}
```

---

#### Soumettre les Réponses
```
POST https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/evaluations/submit
```
**Headers :**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body :**
```json
{
  "template_id": "eval-test-001",
  "duration_seconds": 120,
  "answers": {
    "qcm_qcm-001": "B",
    "qcm_qcm-002": "A",
    "case_case-001_q0": "B",
    "case_case-001_q1": "A",
    "case_case-001_q2": "D"
  }
}
```

**Response :**
```json
{
  "success": true,
  "result": {
    "id": "eval-result-1764260018201",
    "tmcq_score": 28,
    "qcm_score": 20,
    "case_score": 33,
    "qcm_correct": 2,
    "qcm_total": 10,
    "case_correct": 3,
    "case_total": 9,
    "status": "formation_requise"
  }
}
```

---

#### Rapport Narratif
```
GET https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/evaluations/{id}/narrative-report
```
**Headers :**
```
Authorization: Bearer {token}
```

**Response :**
```json
{
  "success": true,
  "report": {
    "doctor": { ... },
    "evaluation": { ... },
    "scores": {
      "tmcq": 28,
      "qcm": 20,
      "clinical_cases": 33
    },
    "status": "formation_requise",
    "competence_level": "Débutant",
    "strong_areas": [...],
    "weak_areas": [...],
    "recommendations": [...]
  }
}
```

---

### 👥 Administration

#### Liste des Médecins
```
GET https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/admin/doctors
```
**Headers :**
```
Authorization: Bearer {admin_token}
```

#### Créer une Évaluation Manuelle
```
POST https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/api/admin/doctor/{doctorId}/evaluate
```
**Headers :**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body :**
```json
{
  "qcm_score": 70,
  "clinical_cases_score": 70,
  "ai_audit_score": 70
}
```

---

## 🔑 Credentials de Test

### Admin
- **Email** : `admin@tibok.mu`
- **Password** : `password123`

### Médecins
1. **Dr. Jean Martin**
   - Email : `dr.jean.martin@tibok.mu`
   - Password : `password123`
   - ID : `doc-001`

2. **Dr. Marie Dubois**
   - Email : `dr.marie.dubois@tibok.mu`
   - Password : `password123`
   - ID : `doc-002`

3. **Dr. Pierre Leclerc**
   - Email : `dr.pierre.leclerc@tibok.mu`
   - Password : `password123`
   - ID : `doc-003`

---

## 📦 Ressources Additionnelles

### Documentation
- **Guide Complet** : [GUIDE_EVALUATION_REPONSES.md](./GUIDE_EVALUATION_REPONSES.md)
- **Réponse Utilisateur** : [REPONSE_UTILISATEUR_EVALUATION.md](./REPONSE_UTILISATEUR_EVALUATION.md)
- **README Principal** : [README.md](./README.md)

### Scripts de Test
- `test-reponses-eval.sh` : Test complet du flux d'évaluation
- `test-eval-interface.sh` : Test de l'API d'évaluation
- `test-status-mapping.sh` : Test du mapping des statuts

### Archive de Sauvegarde
```
https://www.genspark.ai/api/files/s/IYq4FxTt
```
**Taille** : 923 KB
**Description** : Code complet + Documentation + Tests

---

## 🎯 Flux Recommandé pour Tester

### 1️⃣ Test Manuel Complet
1. Ouvrir : [start-evaluation-direct.html](https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html)
2. Attendre le chargement automatique
3. Répondre aux questions (cliquer sur A/B/C/D/E)
4. Cliquer "Suivant" pour naviguer
5. Cliquer "Soumettre" à la fin
6. Consulter les résultats

### 2️⃣ Test API
```bash
cd /home/user/webapp
./test-reponses-eval.sh
```

### 3️⃣ Test Dashboard Admin
1. Ouvrir : [admin-dashboard-full.html](https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/admin-dashboard-full.html)
2. Login : `admin@tibok.mu` / `password123`
3. Explorer les 7 onglets
4. Générer des QCM/cas via IA (strictement 1 par clic)

---

**Date de création** : 27 novembre 2025
**Version** : v1.6.2 FINAL + Réponses Complètes
**Status** : ✅ 100% FONCTIONNEL
