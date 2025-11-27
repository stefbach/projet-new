#!/bin/bash
# Test de mapping des statuts entre doctors et doctors_evaluations

API_BASE="http://localhost:3000/api"

echo "🧪 TEST MAPPING DES STATUTS"
echo "============================"
echo ""

# Login
TOKEN=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.jean.martin@tibok.mu","password":"password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "✅ Token obtenu"
echo ""

# Clean
npx wrangler d1 execute tibok-medical-db --local --command="DELETE FROM evaluation_sessions WHERE doctor_id='doc-001'; DELETE FROM doctors_evaluations WHERE doctor_id='doc-001';" 2>/dev/null > /dev/null

# Test 1: Score 70 → devrait donner supervision
echo "📊 TEST 1: Score 70% → Supervision requise"
curl -s -X POST "$API_BASE/admin/doctor/doc-001/evaluation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"qcm_score": 70, "clinical_cases_score": 70, "ai_audit_score": 70}' > /dev/null

DOCTOR_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT evaluation_status FROM doctors WHERE id='doc-001'" --json 2>/dev/null | grep -o '"evaluation_status":"[^"]*' | cut -d'"' -f4)
EVAL_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT status FROM doctors_evaluations WHERE doctor_id='doc-001' ORDER BY created_at DESC LIMIT 1" --json 2>/dev/null | grep -o '"status":"[^"]*' | cut -d'"' -f4)

echo "  doctors.evaluation_status: $DOCTOR_STATUS"
echo "  doctors_evaluations.status: $EVAL_STATUS"

if [ "$DOCTOR_STATUS" = "supervision_requise" ] && [ "$EVAL_STATUS" = "supervision" ]; then
  echo "  ✅ SUCCÈS: Mapping correct!"
else
  echo "  ❌ ERREUR: Mapping incorrect"
  echo "     Attendu: supervision_requise / supervision"
  echo "     Reçu: $DOCTOR_STATUS / $EVAL_STATUS"
fi
echo ""

# Clean
npx wrangler d1 execute tibok-medical-db --local --command="DELETE FROM doctors_evaluations WHERE doctor_id='doc-001';" 2>/dev/null > /dev/null

# Test 2: Score 85 → devrait donner apte
echo "📊 TEST 2: Score 85% → Apte"
curl -s -X POST "$API_BASE/admin/doctor/doc-001/evaluation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"qcm_score": 85, "clinical_cases_score": 85, "ai_audit_score": 85}' > /dev/null

DOCTOR_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT evaluation_status FROM doctors WHERE id='doc-001'" --json 2>/dev/null | grep -o '"evaluation_status":"[^"]*' | cut -d'"' -f4)
EVAL_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT status FROM doctors_evaluations WHERE doctor_id='doc-001' ORDER BY created_at DESC LIMIT 1" --json 2>/dev/null | grep -o '"status":"[^"]*' | cut -d'"' -f4)

echo "  doctors.evaluation_status: $DOCTOR_STATUS"
echo "  doctors_evaluations.status: $EVAL_STATUS"

if [ "$DOCTOR_STATUS" = "apte" ] && [ "$EVAL_STATUS" = "apte" ]; then
  echo "  ✅ SUCCÈS: Mapping correct!"
else
  echo "  ❌ ERREUR: Mapping incorrect"
  echo "     Attendu: apte / apte"
  echo "     Reçu: $DOCTOR_STATUS / $EVAL_STATUS"
fi
echo ""

# Clean
npx wrangler d1 execute tibok-medical-db --local --command="DELETE FROM doctors_evaluations WHERE doctor_id='doc-001';" 2>/dev/null > /dev/null

# Test 3: Score 50 → devrait donner formation_requise
echo "📊 TEST 3: Score 50% → Formation requise"
curl -s -X POST "$API_BASE/admin/doctor/doc-001/evaluation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"qcm_score": 50, "clinical_cases_score": 50, "ai_audit_score": 50}' > /dev/null

DOCTOR_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT evaluation_status FROM doctors WHERE id='doc-001'" --json 2>/dev/null | grep -o '"evaluation_status":"[^"]*' | cut -d'"' -f4)
EVAL_STATUS=$(npx wrangler d1 execute tibok-medical-db --local --command="SELECT status FROM doctors_evaluations WHERE doctor_id='doc-001' ORDER BY created_at DESC LIMIT 1" --json 2>/dev/null | grep -o '"status":"[^"]*' | cut -d'"' -f4)

echo "  doctors.evaluation_status: $DOCTOR_STATUS"
echo "  doctors_evaluations.status: $EVAL_STATUS"

if [ "$DOCTOR_STATUS" = "formation_requise" ] && [ "$EVAL_STATUS" = "formation_requise" ]; then
  echo "  ✅ SUCCÈS: Mapping correct!"
else
  echo "  ❌ ERREUR: Mapping incorrect"
  echo "     Attendu: formation_requise / formation_requise"
  echo "     Reçu: $DOCTOR_STATUS / $EVAL_STATUS"
fi
echo ""

echo "============================"
echo "✅ TESTS TERMINÉS"
echo "============================"
