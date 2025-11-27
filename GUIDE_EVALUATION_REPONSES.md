# 📋 Guide Complet : Donner les Réponses lors des Évaluations

## ✅ CONFIRMATION CRITIQUE

**OUI, les médecins PEUVENT absolument donner leurs réponses aux QCM et aux cas cliniques pendant l'évaluation !**

Le système est 100% fonctionnel pour :
- ✅ Afficher les questions QCM avec options A/B/C/D/E
- ✅ Afficher les questions de cas cliniques avec options A/B/C/D
- ✅ Permettre la sélection des réponses via interface interactive
- ✅ Enregistrer les réponses en temps réel
- ✅ Soumettre toutes les réponses à la fin
- ✅ Calculer les scores et déterminer le statut

---

## 🎯 Flux Complet d'Évaluation

### 1️⃣ **Démarrage de l'Évaluation**

**URL d'accès :**
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html
```

**Processus :**
1. Connexion automatique (ou utilise le token existant)
2. Chargement du template d'évaluation
3. Transformation des données (QCM et cas cliniques)
4. Redirection vers l'interface d'évaluation

**Fichiers impliqués :**
- `/public/static/start-evaluation-direct.html` - Page de démarrage
- API : `POST /api/evaluations/start`

---

### 2️⃣ **Interface d'Évaluation Interactive**

**URL d'accès :**
```
https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/take-evaluation-simple.html
```

**Fonctionnalités :**

#### Questions QCM
- Affichage de la question
- Options A, B, C, D, E présentées comme boutons radio
- Sélection visuelle avec highlight bleu
- Navigation "Précédent/Suivant"
- **Chaque réponse est automatiquement sauvegardée**

#### Questions de Cas Cliniques
- Présentation du cas (patient, anamnèse, symptômes)
- Questions multiples par cas
- Options A, B, C, D présentées comme boutons radio
- Sélection visuelle avec highlight violet
- **Chaque réponse est automatiquement sauvegardée**

#### Contrôles Généraux
- ⏱️ **Minuteur** : Durée configurable (par défaut 60 minutes)
- 📊 **Barre de progression** : Affiche la position actuelle
- 🔄 **Navigation fluide** : Retour/Avance entre les questions
- ✅ **Bouton "Soumettre"** : Visible à la dernière question

**Fichiers impliqués :**
- `/public/static/take-evaluation-simple.html` - Interface principale
- Format des réponses stockées en mémoire : `{ "qcm_id": "B", "case_id_q0": "A", ... }`

---

### 3️⃣ **Soumission des Réponses**

**Processus :**
1. Utilisateur clique sur "Soumettre"
2. Confirmation demandée
3. Envoi de toutes les réponses au backend
4. Backend évalue les réponses :
   - Compare avec les bonnes réponses
   - Calcule les scores (QCM, Cas cliniques)
   - Calcule le score T-MCQ global
   - Détermine le statut (apte/supervision/formation_requise)
5. Redirection vers la page de résultats

**API utilisée :**
```
POST /api/evaluations/submit
{
  "template_id": "eval-test-001",
  "answers": {
    "qcm_qcm-001": "B",
    "qcm_qcm-002": "A",
    "case_case-001_q0": "B",
    "case_case-001_q1": "A",
    "case_case-001_q2": "D"
  },
  "duration_seconds": 120
}
```

**Fichiers impliqués :**
- `/src/routes/evaluations.ts` - Ligne 680+ (endpoint `/submit`)

---

## 📊 Structure des Réponses

### Format des Clés d'Answers

#### QCM
```javascript
"qcm_{qcm_id}": "B"
// Exemple : "qcm_qcm-001": "B"
```

#### Cas Cliniques
```javascript
"case_{case_id}_q{question_index}": "A"
// Exemple : "case_case-001_q0": "A"
//           "case_case-001_q1": "B"
```

### Exemple de Payload Complet
```json
{
  "template_id": "eval-test-001",
  "duration_seconds": 245,
  "answers": {
    "qcm_qcm-001": "B",
    "qcm_qcm-002": "A",
    "qcm_qcm-003": "C",
    "case_case-001_q0": "B",
    "case_case-001_q1": "A",
    "case_case-001_q2": "D",
    "case_case-002_q0": "A",
    "case_case-002_q1": "C"
  }
}
```

---

## 🧪 Test Complet (API)

### Script de Test Automatique

Le fichier `test-reponses-eval.sh` démontre le flux complet :

```bash
#!/bin/bash

# 1. Login docteur
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.jean.martin@tibok.mu","password":"password123"}' \
  | jq -r '.token')

# 2. Démarrer évaluation
EVAL=$(curl -s -X POST http://localhost:3000/api/evaluations/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"template_id":"eval-test-001"}')

# 3. Soumettre réponses
RESULT=$(curl -s -X POST http://localhost:3000/api/evaluations/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "template_id": "eval-test-001",
    "duration_seconds": 120,
    "answers": {
      "qcm_qcm-001": "B",
      "qcm_qcm-002": "A",
      "case_case-001_q0": "B",
      "case_case-001_q1": "A",
      "case_case-001_q2": "D"
    }
  }')

echo "$RESULT" | jq '.'
```

### Exemple de Résultat
```json
{
  "success": true,
  "result": {
    "id": "eval-result-1764260018201",
    "template_id": "eval-test-001",
    "doctor_id": "doc-001",
    "tmcq_score": 28,
    "qcm_score": 20,
    "case_score": 33,
    "qcm_correct": 2,
    "qcm_total": 10,
    "case_correct": 3,
    "case_total": 9,
    "status": "formation_requise",
    "created_at": "2025-11-27T16:13:38.216Z"
  }
}
```

---

## 📁 Architecture Technique

### Fichiers Clés

#### Frontend
1. **`/public/static/start-evaluation-direct.html`**
   - Auto-login ou utilise token existant
   - Charge le template d'évaluation
   - Transforme les options QCM (array → object {A, B, C, D})
   - Valide les cas cliniques
   - Redirige vers `take-evaluation-simple.html`

2. **`/public/static/take-evaluation-simple.html`**
   - Affiche les questions (QCM et cas cliniques)
   - Gère la sélection des réponses
   - Sauvegarde en temps réel dans `answers = {}`
   - Navigation entre questions
   - Soumission finale

3. **`/public/static/evaluation-results.html`**
   - Affiche les résultats de l'évaluation
   - Scores détaillés
   - Statut final
   - Lien vers rapport narratif

#### Backend
1. **`/src/routes/evaluations.ts`**
   - `POST /api/evaluations/start` (ligne 589) - Démarre l'évaluation
   - `POST /api/evaluations/submit` (ligne 680) - Soumet les réponses

2. **`/src/lib/scoring.ts`**
   - `calculateTMCQ()` - Calcule le score T-MCQ global
   - Détermine le statut basé sur les seuils (85%, 70%, 50%)

#### Base de Données
- **`evaluation_templates`** : Templates d'évaluation
- **`generated_qcm`** : Questions QCM avec `correct_answer`
- **`clinical_cases`** : Cas cliniques avec `questions` (JSON)
- **`doctors_evaluations`** : Résultats enregistrés

---

## 🎯 Points Clés de Conception

### Transformation des Options

Les options des QCM sont stockées en DB comme :
```json
["A) Augmenter Amlodipine", "B) Ajouter un IEC", ...]
```

Elles sont transformées côté frontend en :
```json
{
  "A": "Augmenter Amlodipine",
  "B": "Ajouter un IEC",
  ...
}
```

### Format des Cas Cliniques

Les questions de cas cliniques suivent le format :
```json
{
  "q": "Quelle est votre hypothèse diagnostique principale ?",
  "options": {
    "A": "Péricardite aiguë",
    "B": "Syndrome coronarien aigu (SCA)",
    "C": "Dissection aortique",
    "D": "Embolie pulmonaire"
  },
  "correct": "B",
  "rationale": "Le contexte de douleur thoracique rétrosternale avec irradiation, chez un patient avec facteurs de risque cardiovasculaires, oriente fortement vers un SCA."
}
```

### Calcul des Scores

Le score T-MCQ est calculé selon :
- **QCM** : 40% du poids
- **Cas cliniques** : 60% du poids

Formule :
```
T-MCQ = (QCM_Score * 0.4) + (Case_Score * 0.6)
```

Statuts :
- **≥ 75%** : `apte`
- **≥ 60%** : `supervision`
- **< 60%** : `formation_requise`

**Note :** La table `doctors` utilise `'supervision_requise'` tandis que `doctors_evaluations` utilise `'supervision'` (mapping intelligent implémenté en v1.6.1).

---

## ✅ Validation Complète

### Test Manuel
1. Ouvrir : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html
2. Attendre le chargement automatique
3. Répondre aux questions QCM (cliquer sur A, B, C, D, ou E)
4. Répondre aux questions de cas cliniques (cliquer sur A, B, C, ou D)
5. Cliquer "Suivant" pour naviguer
6. Cliquer "Soumettre" à la fin
7. Consulter les résultats

### Test Automatique
```bash
cd /home/user/webapp
./test-reponses-eval.sh
```

---

## 🚀 Déploiement Production

### URLs Actuelles (Sandbox)
- **Démarrage** : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html
- **Évaluation** : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/take-evaluation-simple.html

### Commandes de Build
```bash
cd /home/user/webapp
npm run build
npm run deploy
```

---

## 📝 Résumé

### Capacités Confirmées ✅
1. ✅ **Affichage des questions QCM** avec options multiples
2. ✅ **Affichage des cas cliniques** avec questions structurées
3. ✅ **Sélection interactive** des réponses via boutons radio
4. ✅ **Sauvegarde automatique** des réponses en mémoire
5. ✅ **Navigation fluide** entre les questions
6. ✅ **Soumission complète** de toutes les réponses
7. ✅ **Évaluation automatique** avec calcul des scores
8. ✅ **Détermination du statut** selon le score T-MCQ
9. ✅ **Affichage des résultats** détaillés
10. ✅ **Génération de rapports** narratifs

### Statut Final
**🎉 SYSTÈME 100% FONCTIONNEL POUR DONNER LES RÉPONSES !**

---

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs du navigateur (F12 → Console)
2. Vérifier les logs du serveur : `pm2 logs --nostream`
3. Tester l'API directement avec `test-reponses-eval.sh`

---

**Date de dernière mise à jour** : 27 novembre 2025
**Version** : v1.6.2 FINAL + Réponses Complètes
