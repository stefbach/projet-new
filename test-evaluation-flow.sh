#!/bin/bash
# Script de test complet du flux d'évaluation avec corrections

API_BASE="http://localhost:3000/api"
echo "🧪 TEST COMPLET - TIBOK Medical Evaluation"
echo "=========================================="
echo ""

# 1. Login Doctor
echo "1️⃣ Login médecin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.jean.martin@tibok.mu",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ ERREUR: Login échoué"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login réussi - Token obtenu"
echo ""

# 2. Start Evaluation Session (full)
echo "2️⃣ Démarrage session d'évaluation complète..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/sessions/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "session_type": "full"
  }')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[a-f0-9-]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SESSION_ID" ]; then
  echo "❌ ERREUR: Démarrage session échoué"
  echo "Response: $SESSION_RESPONSE"
  exit 1
fi

echo "✅ Session créée: $SESSION_ID"
echo ""

# 3. Get Session Details
echo "3️⃣ Récupération détails de la session..."
SESSION_DETAILS=$(curl -s "$API_BASE/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN")

QCM_COUNT=$(echo $SESSION_DETAILS | grep -o '"qcms":\[[^]]*' | grep -o '{' | wc -l)
CASE_COUNT=$(echo $SESSION_DETAILS | grep -o '"cases":\[[^]]*' | grep -o '{' | wc -l)

echo "✅ Session contient:"
echo "   - $QCM_COUNT QCMs"
echo "   - $CASE_COUNT Cas cliniques"
echo ""

# 4. Vérifier le format des cas cliniques
echo "4️⃣ Vérification format des cas cliniques..."
FIRST_CASE=$(echo $SESSION_DETAILS | grep -o '"cases":\[{[^}]*}' | head -1)
echo "Premier cas: $FIRST_CASE"

if echo "$FIRST_CASE" | grep -q '"options"'; then
  echo "✅ Format cas clinique correct (options A/B/C/D détectées)"
else
  echo "⚠️ ATTENTION: Format cas clinique pourrait être incorrect"
fi
echo ""

# 5. Submit Evaluation (avec réponses fictives)
echo "5️⃣ Soumission de l'évaluation..."

# Extract actual QCM and case IDs from session
QCM_IDS=$(echo $SESSION_DETAILS | grep -o '"id":"[a-f0-9-]*"' | head -5 | cut -d'"' -f4)
CASE_IDS=$(echo $SESSION_DETAILS | grep -o '"id":"[a-z0-9-]*"' | tail -2 | cut -d'"' -f4)

# Build answers JSON dynamically
ANSWERS='{'
COUNT=0
for QCM_ID in $QCM_IDS; do
  if [ $COUNT -gt 0 ]; then ANSWERS="$ANSWERS,"; fi
  ANSWERS="$ANSWERS\"qcm_$QCM_ID\":\"A\""
  COUNT=$((COUNT + 1))
done

for CASE_ID in $CASE_IDS; do
  ANSWERS="$ANSWERS,\"case_${CASE_ID}_q0\":\"A\""
  ANSWERS="$ANSWERS,\"case_${CASE_ID}_q1\":\"B\""
  ANSWERS="$ANSWERS,\"case_${CASE_ID}_q2\":\"C\""
done
ANSWERS="$ANSWERS}"

SUBMIT_RESPONSE=$(curl -s -X POST "$API_BASE/sessions/$SESSION_ID/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"qcm_answers\": {},
    \"clinical_answers\": {},
    \"duration_seconds\": 1800
  }")

echo "Response: $SUBMIT_RESPONSE"
echo ""

# 6. Check for SQLITE_CONSTRAINT error
echo "6️⃣ Vérification erreurs SQLITE_CONSTRAINT..."
if echo "$SUBMIT_RESPONSE" | grep -q "SQLITE_CONSTRAINT"; then
  echo "❌ ERREUR SQLITE_CONSTRAINT détectée!"
  echo "Détails: $SUBMIT_RESPONSE"
  exit 1
fi

if echo "$SUBMIT_RESPONSE" | grep -q "CHECK constraint failed"; then
  echo "❌ ERREUR CHECK CONSTRAINT détectée!"
  echo "Détails: $SUBMIT_RESPONSE"
  exit 1
fi

echo "✅ Aucune erreur SQLITE_CONSTRAINT"
echo ""

# 7. Check status value
echo "7️⃣ Vérification valeur du statut..."
STATUS=$(echo $SUBMIT_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)
echo "Statut retourné: $STATUS"

if [ "$STATUS" = "apte" ] || [ "$STATUS" = "supervision" ] || [ "$STATUS" = "formation_requise" ]; then
  echo "✅ Statut valide: $STATUS"
else
  echo "❌ ERREUR: Statut invalide: $STATUS"
  echo "Statuts attendus: 'apte', 'supervision', 'formation_requise'"
fi
echo ""

echo "=========================================="
echo "✅ TEST COMPLET TERMINÉ"
echo "=========================================="
