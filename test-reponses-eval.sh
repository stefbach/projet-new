#!/bin/bash

echo "=== TEST COMPLET : DONNER LES RÉPONSES QCM + CAS CLINIQUES ==="
echo ""

# 1. Login
echo "1️⃣ Login..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.jean.martin@tibok.mu","password":"password123"}' \
  | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Échec login"
  exit 1
fi
echo "✅ Token OK"

# 2. Start evaluation
echo ""
echo "2️⃣ Démarrage évaluation..."
EVAL=$(curl -s -X POST http://localhost:3000/api/evaluations/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"template_id":"eval-test-001"}')

echo "$EVAL" | jq -r '"✅ Évaluation démarrée: \(.evaluation.name)\n   - QCMs: \(.evaluation.qcms | length)\n   - Cas cliniques: \(.evaluation.cases | length)"'

# Extract IDs
QCM1=$(echo "$EVAL" | jq -r '.evaluation.qcms[0].id')
QCM2=$(echo "$EVAL" | jq -r '.evaluation.qcms[1].id')
CASE1=$(echo "$EVAL" | jq -r '.evaluation.cases[0].id')

echo ""
echo "3️⃣ Préparation des réponses..."
echo "   QCM #1: $QCM1 → Réponse 'B'"
echo "   QCM #2: $QCM2 → Réponse 'A'"
echo "   Cas #1: $CASE1"
echo "      - Question 0 → Réponse 'B'"
echo "      - Question 1 → Réponse 'A'"
echo "      - Question 2 → Réponse 'D'"

# 4. Submit answers
echo ""
echo "4️⃣ Soumission des réponses..."
RESULT=$(curl -s -X POST http://localhost:3000/api/evaluations/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"template_id\": \"eval-test-001\",
    \"duration_seconds\": 120,
    \"answers\": {
      \"qcm_${QCM1}\": \"B\",
      \"qcm_${QCM2}\": \"A\",
      \"case_${CASE1}_q0\": \"B\",
      \"case_${CASE1}_q1\": \"A\",
      \"case_${CASE1}_q2\": \"D\"
    }
  }")

echo "$RESULT" | jq '.'

if [ "$(echo "$RESULT" | jq -r '.success')" = "true" ]; then
  echo ""
  echo "✅ RÉSULTAT:"
  echo "$RESULT" | jq -r '"   T-MCQ: \(.result.tmcq_score)%\n   QCM: \(.result.qcm_score)% (\(.result.qcm_correct)/\(.result.qcm_total))\n   Cas: \(.result.case_score)% (\(.result.case_correct)/\(.result.case_total))\n   Statut: \(.result.status | ascii_upcase)"'
  
  echo ""
  echo "🎉 SUCCÈS ! Les médecins PEUVENT donner leurs réponses !"
  echo ""
  echo "📱 URLs pour tester manuellement:"
  echo "   https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html"
else
  echo ""
  echo "❌ Erreur: $(echo "$RESULT" | jq -r '.error')"
fi
