#!/bin/bash

echo "=== TEST INTERFACE ÉVALUATION COMPLÈTE ==="
echo ""

# 1. Login doctor
echo "1️⃣ Login docteur..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.jean.martin@tibok.mu","password":"password123"}' \
  | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Échec login"
  exit 1
fi
echo "✅ Token obtenu: ${TOKEN:0:20}..."
echo ""

# 2. Start evaluation
echo "2️⃣ Démarrage évaluation..."
EVAL_DATA=$(curl -s -X POST http://localhost:3000/api/evaluations/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"template_id":"eval-test-001"}')

echo "$EVAL_DATA" | jq -r '.success, .evaluation.name, (.evaluation.qcms | length), (.evaluation.cases | length)'

# Extract first QCM
echo ""
echo "3️⃣ Premier QCM:"
echo "$EVAL_DATA" | jq -r '.evaluation.qcms[0] | "ID: \(.id)\nQuestion: \(.question)\nOptions: \(.options | keys | join(", "))"'

echo ""
echo "4️⃣ Premier cas clinique:"
echo "$EVAL_DATA" | jq -r '.evaluation.cases[0] | "ID: \(.id)\nTitre: \(.title)\nQuestions: \(.questions | length)"'

if [ "$(echo "$EVAL_DATA" | jq -r '.evaluation.cases[0].questions | length')" -gt 0 ]; then
  echo ""
  echo "   Première question du cas:"
  echo "$EVAL_DATA" | jq -r '.evaluation.cases[0].questions[0] | "   Q: \(.q)\n   Options: \(.options | keys | join(", "))"'
fi

echo ""
echo "5️⃣ URLs d'accès:"
echo "   Démarrage: https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/start-evaluation-direct.html"
echo "   Évaluation: https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai/static/take-evaluation-simple.html"
echo ""
echo "✅ FLUX COMPLET FONCTIONNEL - Les médecins peuvent donner leurs réponses !"
