# Guide de Génération du Contenu Médical

## 🎯 Objectif

Générer les **144 QCM supplémentaires** et **29 cas cliniques supplémentaires** via l'API OpenAI GPT-4.

**Statut actuel :**
- QCM : 6/150 (144 à générer)
- Cas cliniques : 1/30 (29 à générer)

---

## 🔑 Prérequis

### 1. Configurer la clé OpenAI API

**Pour le développement local (.dev.vars) :**
```bash
cd /home/user/webapp
cat > .dev.vars << 'EOF'
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
EOF
```

**Pour la production (Cloudflare secrets) :**
```bash
npx wrangler secret put OPENAI_API_KEY --project-name tibok-medical-evaluation
# Entrer votre clé OpenAI quand demandé
```

---

## 📝 Génération des QCM

### Distribution recommandée (150 QCM au total)

| Catégorie | Nombre | Difficulté | Guidelines |
|-----------|--------|------------|------------|
| **Hypertension** | 20 | 7 basic, 10 intermediate, 3 advanced | WHO Hypertension Guidelines 2021 |
| **Diabète** | 20 | 7 basic, 10 intermediate, 3 advanced | IDF Diabetes Atlas 2024 |
| **Asthme/COPD** | 15 | 5 basic, 8 intermediate, 2 advanced | GINA Guidelines 2024 |
| **Infectiologie tropicale** | 20 | 8 basic, 10 intermediate, 2 advanced | WHO Tropical Diseases Guidelines |
| **Dermatologie** | 15 | 8 basic, 6 intermediate, 1 advanced | WHO Essential Medicines List 2023 |
| **Médecine générale** | 20 | 10 basic, 8 intermediate, 2 advanced | Medical Council Mauritius |
| **Urgences & Red Flags** | 15 | 3 basic, 8 intermediate, 4 advanced | WHO Emergency Care Guidelines |
| **Prescription** | 10 | 5 basic, 4 intermediate, 1 advanced | WHO EML 2023 |
| **Téléconsultation** | 10 | 5 basic, 4 intermediate, 1 advanced | WHO Digital Health Guidelines 2019 |
| **Éthique médicale** | 5 | 3 basic, 2 intermediate, 0 advanced | Medical Council Mauritius Code 2023 |
| **TOTAL** | **150** | **61 basic, 70 intermediate, 19 advanced** | |

### Script de génération (curl)

```bash
#!/bin/bash
# generate_qcm.sh

API_BASE="http://localhost:3000/api"

# Hypertension (20 QCM)
echo "Génération QCM Hypertension..."
curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Hypertension arterielle",
    "count": 7,
    "difficulty": "basic",
    "guidelines": "WHO Hypertension Guidelines 2021"
  }'

curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Hypertension arterielle",
    "count": 10,
    "difficulty": "intermediate",
    "guidelines": "WHO Hypertension Guidelines 2021"
  }'

curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Hypertension arterielle",
    "count": 3,
    "difficulty": "advanced",
    "guidelines": "WHO Hypertension Guidelines 2021"
  }'

# Diabète (20 QCM)
echo "Génération QCM Diabète..."
curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Diabete type 2",
    "count": 7,
    "difficulty": "basic",
    "guidelines": "IDF Diabetes Atlas 2024"
  }'

curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Diabete type 2",
    "count": 10,
    "difficulty": "intermediate",
    "guidelines": "IDF Diabetes Atlas 2024"
  }'

curl -X POST "$API_BASE/generate/qcm" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Diabete type 2",
    "count": 3,
    "difficulty": "advanced",
    "guidelines": "IDF Diabetes Atlas 2024"
  }'

# Continuer pour les autres catégories...
```

### Via le Dashboard Admin

1. Accéder à : https://3000-i74jz396v7wfa24ul9ju2-cbeee0f9.sandbox.novita.ai
2. Onglet **"Générer Contenu"**
3. Remplir le formulaire :
   - Topic : ex. "Hypertension artérielle"
   - Nombre : ex. 10
   - Difficulté : basic/intermediate/advanced
   - Guidelines : ex. "WHO Hypertension Guidelines 2021"
4. Cliquer sur **"Générer QCM"**
5. Répéter pour chaque catégorie

---

## 🏥 Génération des Cas Cliniques

### Distribution recommandée (30 cas au total)

| Spécialité | Nombre | Complexité | Guidelines |
|------------|--------|------------|------------|
| **Cardiologie** | 5 | 2 simple, 2 intermediate, 1 complex | WHO Cardiovascular Guidelines |
| **Endocrinologie** | 5 | 2 simple, 2 intermediate, 1 complex | IDF Diabetes Atlas 2024 |
| **Pneumologie** | 4 | 2 simple, 2 intermediate | GINA Guidelines 2024 |
| **Infectiologie** | 5 | 2 simple, 2 intermediate, 1 complex | WHO Tropical Diseases |
| **Dermatologie** | 3 | 2 simple, 1 intermediate | WHO Essential Medicines |
| **Médecine générale** | 4 | 2 simple, 2 intermediate | Medical Council Mauritius |
| **Urgences** | 4 | 1 simple, 2 intermediate, 1 complex | WHO Emergency Care |
| **TOTAL** | **30** | **13 simple, 13 intermediate, 4 complex** | |

### Script de génération

```bash
#!/bin/bash
# generate_cases.sh

API_BASE="http://localhost:3000/api"

# Cardiologie (5 cas)
echo "Génération cas Cardiologie..."
curl -X POST "$API_BASE/generate/clinical-case" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Cardiologie",
    "complexity": "simple"
  }'

curl -X POST "$API_BASE/generate/clinical-case" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Cardiologie",
    "complexity": "simple"
  }'

curl -X POST "$API_BASE/generate/clinical-case" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Cardiologie",
    "complexity": "intermediate"
  }'

curl -X POST "$API_BASE/generate/clinical-case" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Cardiologie",
    "complexity": "intermediate"
  }'

curl -X POST "$API_BASE/generate/clinical-case" \
  -H "Content-Type: application/json" \
  -d '{
    "specialty": "Cardiologie",
    "complexity": "complex",
    "patient_profile": {
      "age_range": "50-65",
      "sex": "M",
      "location": "Maurice"
    }
  }'

# Continuer pour les autres spécialités...
```

### Via le Dashboard Admin

1. Onglet **"Générer Contenu"**
2. Section **"Générer Cas Clinique"**
3. Remplir :
   - Spécialité : ex. "Cardiologie"
   - Complexité : simple/intermediate/complex
4. Cliquer sur **"Générer Cas Clinique"**
5. Répéter pour chaque spécialité

---

## 🚀 Génération en Masse (Recommandé)

### Script Python complet

```python
#!/usr/bin/env python3
# generate_all_content.py

import requests
import time
import json

API_BASE = "http://localhost:3000/api"

# Configuration QCM
qcm_config = [
    {"topic": "Hypertension arterielle", "count": 14, "difficulty": "basic", "guidelines": "WHO Hypertension Guidelines 2021"},
    {"topic": "Hypertension arterielle", "count": 10, "difficulty": "intermediate", "guidelines": "WHO Hypertension Guidelines 2021"},
    {"topic": "Hypertension arterielle", "count": 3, "difficulty": "advanced", "guidelines": "WHO Hypertension Guidelines 2021"},
    
    {"topic": "Diabete type 2", "count": 14, "difficulty": "basic", "guidelines": "IDF Diabetes Atlas 2024"},
    {"topic": "Diabete type 2", "count": 10, "difficulty": "intermediate", "guidelines": "IDF Diabetes Atlas 2024"},
    {"topic": "Diabete type 2", "count": 3, "difficulty": "advanced", "guidelines": "IDF Diabetes Atlas 2024"},
    
    # Ajouter les autres catégories...
]

# Configuration Cas Cliniques
cases_config = [
    {"specialty": "Cardiologie", "complexity": "simple"},
    {"specialty": "Cardiologie", "complexity": "simple"},
    {"specialty": "Cardiologie", "complexity": "intermediate"},
    {"specialty": "Cardiologie", "complexity": "intermediate"},
    {"specialty": "Cardiologie", "complexity": "complex"},
    
    # Ajouter les autres spécialités...
]

def generate_qcm(config):
    try:
        response = requests.post(
            f"{API_BASE}/generate/qcm",
            json=config,
            timeout=60
        )
        response.raise_for_status()
        print(f"✓ {config['count']} QCM générés: {config['topic']} ({config['difficulty']})")
        return response.json()
    except Exception as e:
        print(f"✗ Erreur QCM {config['topic']}: {e}")
        return None

def generate_case(config):
    try:
        response = requests.post(
            f"{API_BASE}/generate/clinical-case",
            json=config,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        print(f"✓ Cas clinique généré: {result['clinical_case']['title']}")
        return result
    except Exception as e:
        print(f"✗ Erreur cas {config['specialty']}: {e}")
        return None

# Générer tous les QCM
print("=== GÉNÉRATION DES QCM ===")
for config in qcm_config:
    generate_qcm(config)
    time.sleep(2)  # Pause pour éviter rate limiting

print("\n=== GÉNÉRATION DES CAS CLINIQUES ===")
for config in cases_config:
    generate_case(config)
    time.sleep(2)

print("\n✓ Génération terminée !")
```

---

## ⚙️ Configuration Rate Limiting OpenAI

### Limites OpenAI GPT-4 Turbo
- **Tier 1** (compte gratuit) : 500 requêtes/jour
- **Tier 2+** (avec paiement) : 10,000 requêtes/jour

### Recommandations
- Générer par lots de 10-20 QCM
- Pause de 2-3 secondes entre requêtes
- Surveiller les coûts (~$0.01-0.03 par génération)

### Estimation de coûts
- **150 QCM** : ~$3-5
- **30 Cas cliniques** : ~$2-3
- **Total estimé** : ~$5-8

---

## ✅ Vérification post-génération

```bash
# Vérifier le nombre total
curl -s "http://localhost:3000/api/admin/stats" | jq '.stats.content'

# Expected output:
# {
#   "total_qcm": 150,
#   "total_cases": 30
# }

# Récupérer un échantillon aléatoire
curl -s "http://localhost:3000/api/generate/qcm/random?count=5"
curl -s "http://localhost:3000/api/generate/clinical-case/random"
```

---

## 📊 Suivi de progression

Créer un fichier de tracking :

```bash
# progress.txt
QCM:
  Hypertension: 0/20
  Diabète: 0/20
  Asthme: 0/15
  Infectiologie: 0/20
  Dermatologie: 0/15
  Médecine générale: 0/20
  Urgences: 0/15
  Prescription: 0/10
  Téléconsultation: 0/10
  Éthique: 0/5

Cas Cliniques:
  Cardiologie: 0/5
  Endocrinologie: 0/5
  Pneumologie: 0/4
  Infectiologie: 0/5
  Dermatologie: 0/3
  Médecine générale: 0/4
  Urgences: 0/4
```

---

## 🎯 Ordre de génération recommandé

### Phase 1 : Contenu prioritaire (Semaine 1)
1. Hypertension (20 QCM)
2. Diabète (20 QCM)
3. Cardiologie (5 cas)
4. Endocrinologie (5 cas)

### Phase 2 : Contenu courant (Semaine 2)
5. Asthme/COPD (15 QCM)
6. Médecine générale (20 QCM)
7. Pneumologie (4 cas)
8. Médecine générale (4 cas)

### Phase 3 : Contenu spécialisé (Semaine 3)
9. Infectiologie (20 QCM + 5 cas)
10. Dermatologie (15 QCM + 3 cas)
11. Urgences (15 QCM + 4 cas)

### Phase 4 : Finalisation (Semaine 4)
12. Prescription (10 QCM)
13. Téléconsultation (10 QCM)
14. Éthique (5 QCM)
15. Vérification qualité complète

---

## 🔍 Contrôle Qualité

Pour chaque QCM/cas généré, vérifier :

✅ **Source vérifiable** (OMS, WHO, IDF, GINA, Medical Council)  
✅ **Justification clinique** claire et précise  
✅ **Conformité WHO EML 2023** pour prescriptions  
✅ **Contexte Maurice** (maladies tropicales, prévalences locales)  
✅ **Red flags** correctement identifiés  

---

## 📞 Support

En cas de problème :
1. Vérifier la clé OpenAI API (`.dev.vars` ou secrets Cloudflare)
2. Consulter les logs : `pm2 logs tibok-medical-evaluation --nostream`
3. Tester manuellement via Dashboard Admin
4. Vérifier le budget OpenAI : https://platform.openai.com/usage

---

**Prochaine étape :** Lancer la génération du contenu manquant ! 🚀
