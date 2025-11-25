# Guide Complet API - Tibok Medical Evaluation

## 🔐 Authentification

Toutes les routes API (sauf `/auth/*`) nécessitent un token JWT.

### Header d'authentification
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📝 ENDPOINTS DISPONIBLES

### 🔑 **Authentication** (`/api/auth/*`)

#### 1. Créer un compte médecin
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "dr.martin@tibok.mu",
  "password": "Password123!",
  "name": "Dr. Jean Martin",
  "specialty": "Médecine Générale",      # Optionnel
  "license_number": "MMC-2020-1234"      # Optionnel
}

# Response 201
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "doctor": {
    "id": "uuid",
    "email": "dr.martin@tibok.mu",
    "name": "Dr. Jean Martin",
    "specialty": "Médecine Générale",
    "role": "doctor"
  }
}
```

#### 2. Se connecter
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "dr.martin@tibok.mu",
  "password": "Password123!"
}

# Response 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "doctor": {
    "id": "uuid",
    "email": "dr.martin@tibok.mu",
    "name": "Dr. Jean Martin",
    "specialty": "Médecine Générale",
    "role": "doctor"
  }
}
```

#### 3. Créer un admin (provisoire - à sécuriser)
```bash
POST /api/auth/create-admin
Content-Type: application/json

{
  "email": "admin@tibok.mu",
  "password": "Admin2025!",
  "name": "Admin Tibok"
}
```

#### 4. Obtenir ses infos (avec token)
```bash
GET /api/auth/me
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "email": "dr.martin@tibok.mu",
    "name": "Dr. Jean Martin",
    ...
  }
}
```

---

### 👨‍⚕️ **Gestion Médecins** (`/api/doctors/*`)

#### 1. Mon profil
```bash
GET /api/doctors/me
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "doctor": {
    "id": "uuid",
    "email": "dr.martin@tibok.mu",
    "name": "Dr. Jean Martin",
    "specialty": "Médecine Générale",
    "license_number": "MMC-2020-1234",
    "role": "doctor",
    "status": "active",
    "last_login": "2025-11-25T10:30:00Z",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### 2. Mettre à jour mon profil
```bash
PUT /api/doctors/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dr. Jean Martin",           # Optionnel
  "specialty": "Cardiologie",          # Optionnel
  "license_number": "MMC-2020-1234"    # Optionnel
}

# Response 200
{
  "success": true,
  "message": "Profile updated"
}
```

#### 3. Mes statistiques
```bash
GET /api/doctors/me/stats
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "stats": {
    "latest_evaluation": {
      "tmcq_total": 85,
      "status": "apte",
      "evaluation_date": "2025-11-20"
    },
    "qcm": {
      "total_attempts": 150,
      "correct_answers": 120,
      "success_rate": 80.0
    },
    "clinical_cases": {
      "total_attempts": 10,
      "average_score": 78.5
    },
    "unresolved_alerts": 0
  }
}
```

#### 4. Mon historique d'évaluations
```bash
GET /api/doctors/me/evaluations
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "evaluations": [
    {
      "id": "uuid",
      "tmcq_total": 85,
      "status": "apte",
      "qcm_score": 82,
      "clinical_cases_score": 88,
      "evaluation_date": "2025-11-20"
    }
  ]
}
```

#### 5. Liste médecins (ADMIN uniquement)
```bash
GET /api/doctors?limit=50&offset=0
Authorization: Bearer {admin_token}

# Response 200
{
  "success": true,
  "count": 50,
  "doctors": [...]
}
```

#### 6. Créer un médecin (ADMIN uniquement)
```bash
POST /api/doctors
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "dr.new@tibok.mu",
  "password": "Password123!",
  "name": "Dr. New Doctor",
  "specialty": "Pediatrie",
  "license_number": "MMC-2025-XXX",
  "role": "doctor"                     # Ou "admin"
}
```

---

### 📝 **Sessions d'Évaluation** (`/api/sessions/*`)

#### 1. Démarrer une session
```bash
POST /api/sessions/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "session_type": "qcm"    # Valeurs: "qcm", "clinical_cases", "full"
}

# Response 200
{
  "success": true,
  "session": {
    "id": "session-uuid",
    "session_type": "qcm",
    "status": "in_progress",
    "started_at": "2025-11-25T10:00:00Z"
  },
  "content": {
    "qcms": [
      {
        "id": "qcm-uuid",
        "topic": "Hypertension",
        "difficulty": "intermediate",
        "question": "Patient de 55 ans...",
        "options": {
          "A": "...",
          "B": "...",
          "C": "...",
          "D": "..."
        }
      }
    ],
    "clinical_cases": []
  }
}
```

#### 2. Soumettre les réponses
```bash
POST /api/sessions/{session_id}/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "qcm_answers": [
    {
      "qcm_id": "qcm-uuid-1",
      "selected_answer": "B",
      "time_taken_seconds": 45
    },
    {
      "qcm_id": "qcm-uuid-2",
      "selected_answer": "A",
      "time_taken_seconds": 60
    }
  ],
  "case_answers": [
    {
      "case_id": "case-uuid-1",
      "answers": ["B", "C", "A"]
    }
  ]
}

# Response 200
{
  "success": true,
  "session_id": "session-uuid",
  "scores": {
    "qcm_score": 85,
    "cases_score": 78,
    "total_score": 81
  },
  "message": "Session completed successfully"
}
```

#### 3. Mes sessions
```bash
GET /api/sessions/me
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "sessions": [
    {
      "id": "uuid",
      "session_type": "qcm",
      "status": "completed",
      "started_at": "2025-11-25T10:00:00Z",
      "completed_at": "2025-11-25T10:45:00Z",
      "qcm_score": 85,
      "total_score": 85
    }
  ]
}
```

#### 4. Détails d'une session
```bash
GET /api/sessions/{session_id}
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "session": {
    "id": "uuid",
    "doctor_id": "doctor-uuid",
    "session_type": "full",
    "status": "completed",
    ...
  }
}
```

#### 5. Annuler une session en cours
```bash
POST /api/sessions/{session_id}/cancel
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "message": "Session cancelled"
}
```

---

### 🤖 **Génération IA** (`/api/generate/*`)

#### 1. Générer des QCM
```bash
POST /api/generate/qcm
Authorization: Bearer {token}
Content-Type: application/json

{
  "topic": "Hypertension arterielle",
  "count": 10,
  "difficulty": "intermediate",        # basic, intermediate, advanced
  "guidelines": "WHO Hypertension Guidelines 2021"
}

# Response 200
{
  "success": true,
  "count": 10,
  "qcms": [...]
}
```

#### 2. Récupérer des QCM aléatoires
```bash
GET /api/generate/qcm/random?count=10&difficulty=intermediate&topic=Diabete
Authorization: Bearer {token}

# Response 200
{
  "success": true,
  "count": 10,
  "qcms": [...]
}
```

#### 3. Générer un cas clinique
```bash
POST /api/generate/clinical-case
Authorization: Bearer {token}
Content-Type: application/json

{
  "specialty": "Cardiologie",
  "complexity": "intermediate",        # simple, intermediate, complex
  "patient_profile": {                 # Optionnel
    "age_range": "50-65",
    "sex": "M",
    "location": "Maurice"
  }
}

# Response 200
{
  "success": true,
  "clinical_case": {
    "id": "uuid",
    "specialty": "Cardiologie",
    "title": "HTA non contrôlée...",
    "patient_profile": {...},
    "presentation": "...",
    "questions": [...],
    ...
  }
}
```

---

### 📊 **Administration** (`/api/admin/*`) - ADMIN uniquement

#### 1. Statistiques globales
```bash
GET /api/admin/stats
Authorization: Bearer {admin_token}

# Response 200
{
  "success": true,
  "stats": {
    "total_doctors": 25,
    "status_distribution": [...],
    "unresolved_alerts": [...],
    "flagged_audits": 3,
    "average_tmcq_30days": 82.5,
    "content": {
      "total_qcm": 150,
      "total_cases": 30
    }
  }
}
```

#### 2. Liste des médecins
```bash
GET /api/admin/doctors?status=apte&limit=50&offset=0
Authorization: Bearer {admin_token}
```

#### 3. Détails d'un médecin
```bash
GET /api/admin/doctor/{doctor_id}
Authorization: Bearer {admin_token}

# Response 200
{
  "success": true,
  "doctor": {...},
  "evaluations": [...],
  "recent_audits": [...],
  "unresolved_alerts": [...]
}
```

#### 4. Liste des audits
```bash
GET /api/admin/audits?flagged=1&severity=high&limit=50
Authorization: Bearer {admin_token}
```

#### 5. Liste des alertes
```bash
GET /api/admin/alerts?resolved=0&severity=critical&limit=50
Authorization: Bearer {admin_token}
```

#### 6. Résoudre une alerte
```bash
PUT /api/admin/alert/{alert_id}/resolve
Authorization: Bearer {admin_token}

# Response 200
{
  "success": true,
  "message": "Alert resolved"
}
```

---

## 🔥 **WORKFLOW COMPLET D'ÉVALUATION**

### 1. Inscription / Connexion
```bash
# Inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.test@tibok.mu","password":"Doctor@2025!","name":"Dr. Test"}'

# Connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.test@tibok.mu","password":"Doctor@2025!"}'

# Sauvegarder le token reçu
TOKEN="eyJhbGc..."
```

### 2. Démarrer une évaluation complète
```bash
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"session_type":"full"}'

# Sauvegarder le session_id
SESSION_ID="session-uuid"
```

### 3. Passer les tests (50 QCM + 5 cas cliniques)
```bash
# Répondre aux QCM...
# Répondre aux cas cliniques...
```

### 4. Soumettre les réponses
```bash
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "qcm_answers": [
      {"qcm_id":"qcm-1","selected_answer":"B","time_taken_seconds":45},
      ...
    ],
    "case_answers": [
      {"case_id":"case-1","answers":["B","C","A"]},
      ...
    ]
  }'
```

### 5. Consulter ses résultats
```bash
# Stats personnelles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/doctors/me/stats

# Historique
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/doctors/me/evaluations
```

---

## 🔐 **Sécurité**

### Token JWT
- **Expiration** : 7 jours
- **Format** : `Bearer {token}`
- **Contenu** : `{doctor_id, email, role, iat, exp}`

### Rôles
- **doctor** : Accès aux routes `/api/doctors/me`, `/api/sessions`
- **admin** : Accès complet + `/api/admin/*`

### Erreurs HTTP
- `401 Unauthorized` : Token manquant ou invalide
- `403 Forbidden` : Accès admin requis
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Email déjà utilisé
- `500 Internal Server Error` : Erreur serveur

---

## 📱 **Accès Frontend**

- **Login Page** : http://localhost:3000/static/login.html
- **Admin Dashboard** : http://localhost:3000/
- **Doctor Dashboard** : http://localhost:3000/static/doctor-dashboard.html (à créer)

---

## 🎯 **Prochaines étapes**

1. ✅ Système d'authentification complet
2. ✅ Gestion des comptes médecins
3. ✅ Sessions d'évaluation pilotables
4. ✅ Workflow de test complet
5. ⏳ Dashboard médecin (interface graphique)
6. ⏳ Génération des 144 QCM manquants
7. ⏳ Génération des 29 cas cliniques manquants

---

**La plateforme est maintenant OPÉRATIONNELLE pour les évaluations médicales !** 🎉
