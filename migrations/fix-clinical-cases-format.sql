-- Fix des anciens cas cliniques pour utiliser le format avec choix multiples

-- Case 001: Douleur thoracique aiguë
UPDATE clinical_cases SET questions = '[
  {
    "q": "Quelle est votre hypothèse diagnostique principale ?",
    "options": {
      "A": "Péricardite aiguë",
      "B": "Syndrome coronarien aigu (SCA)",
      "C": "Embolie pulmonaire",
      "D": "Dissection aortique"
    },
    "correct": "B",
    "rationale": "Le syndrome coronarien aigu est la première cause à éliminer devant une douleur thoracique aiguë avec facteurs de risque cardiovasculaires."
  },
  {
    "q": "Quels examens demandez-vous en urgence ?",
    "options": {
      "A": "Radiographie thoracique uniquement",
      "B": "ECG + Troponine + Bilan complet",
      "C": "Scanner thoracique avec injection",
      "D": "Échographie cardiaque seulement"
    },
    "correct": "B",
    "rationale": "L''ECG et la troponine sont essentiels pour diagnostiquer un SCA. Un bilan complet permet d''évaluer les facteurs de risque et complications."
  },
  {
    "q": "Quelle est la prise en charge immédiate ?",
    "options": {
      "A": "Repos strict et surveillance",
      "B": "Aspirine 300mg + Monitoring + Contact cardiologue",
      "C": "AINS + Repos",
      "D": "Anticoagulation immédiate"
    },
    "correct": "B",
    "rationale": "L''aspirine est le traitement immédiat du SCA, avec surveillance continue et avis cardiologique urgent pour envisager une angioplastie."
  }
]'
WHERE id = 'case-001';

-- Case 002: Fièvre et éruption chez l'enfant
UPDATE clinical_cases SET questions = '[
  {
    "q": "Quel est le diagnostic le plus probable ?",
    "options": {
      "A": "Varicelle",
      "B": "Rougeole",
      "C": "Scarlatine",
      "D": "Dengue"
    },
    "correct": "B",
    "rationale": "La combinaison fièvre + éruption maculopapuleuse + signes de Koplik évoque fortement la rougeole, maladie à déclaration obligatoire."
  },
  {
    "q": "Quelle conduite thérapeutique adoptez-vous ?",
    "options": {
      "A": "Antibiotiques systématiques",
      "B": "Traitement symptomatique + Vitamine A + Isolement",
      "C": "Corticoïdes",
      "D": "Antiviraux spécifiques"
    },
    "correct": "B",
    "rationale": "La rougeole nécessite un traitement symptomatique, vitamine A selon OMS, et isolement pour éviter la contagion."
  },
  {
    "q": "Quelles complications devez-vous surveiller ?",
    "options": {
      "A": "Complications neurologiques uniquement",
      "B": "Pneumonie + Encéphalite + Otite",
      "C": "Complications rénales",
      "D": "Complications hépatiques"
    },
    "correct": "B",
    "rationale": "Les principales complications de la rougeole sont respiratoires (pneumonie), neurologiques (encéphalite) et ORL (otite)."
  }
]'
WHERE id = 'case-002';

-- Case 003: Insuffisance cardiaque décompensée
UPDATE clinical_cases SET questions = '[
  {
    "q": "Quel examen confirme l''insuffisance cardiaque ?",
    "options": {
      "A": "ECG",
      "B": "Radiographie thoracique",
      "C": "Échocardiographie + BNP/NT-proBNP",
      "D": "Scanner thoracique"
    },
    "correct": "C",
    "rationale": "L''échocardiographie évalue la fonction cardiaque, et le BNP/NT-proBNP confirme l''insuffisance cardiaque selon les guidelines ESC."
  },
  {
    "q": "Quelle est la prise en charge initiale ?",
    "options": {
      "A": "Repos strict uniquement",
      "B": "Furosémide IV + Oxygène + Restriction hydrique",
      "C": "Digitaliques en première intention",
      "D": "Bêtabloquants en urgence"
    },
    "correct": "B",
    "rationale": "Le traitement de la décompensation cardiaque aiguë repose sur les diurétiques IV (furosémide), l''oxygénothérapie et la restriction hydrique."
  },
  {
    "q": "Quel traitement de fond instaurer ?",
    "options": {
      "A": "AINS + Diurétiques",
      "B": "IEC/ARA2 + Bêtabloquants + Antialdostérone",
      "C": "Calcium + Magnésium",
      "D": "Corticoïdes"
    },
    "correct": "B",
    "rationale": "Le traitement de fond de l''insuffisance cardiaque comprend IEC ou ARA2, bêtabloquants et antialdostérone selon les guidelines ESC/AHA."
  }
]'
WHERE id = 'case-003';

-- Case 004: Crise d'asthme aiguë
UPDATE clinical_cases SET questions = '[
  {
    "q": "Comment évaluer la sévérité de la crise ?",
    "options": {
      "A": "Signes cliniques uniquement",
      "B": "Fréquence respiratoire + DEP + SpO2 + Signes d''épuisement",
      "C": "Radiographie thoracique",
      "D": "Gaz du sang systématiques"
    },
    "correct": "B",
    "rationale": "La sévérité se base sur FR, DEP, SpO2 et signes d''épuisement selon GINA (Global Initiative for Asthma)."
  },
  {
    "q": "Quel est le traitement de première ligne ?",
    "options": {
      "A": "Corticoïdes oraux uniquement",
      "B": "Bêta-2 mimétiques inhalés + Oxygène + Corticoïdes systémiques",
      "C": "Antibiotiques",
      "D": "Bronchodilatateurs oraux"
    },
    "correct": "B",
    "rationale": "Le traitement de la crise d''asthme comprend bêta-2 mimétiques inhalés (salbutamol), O2 si SpO2<90%, et corticoïdes systémiques."
  },
  {
    "q": "Quand hospitaliser ?",
    "options": {
      "A": "Toujours",
      "B": "Si crise sévère, DEP<50%, pas d''amélioration après traitement",
      "C": "Jamais",
      "D": "Uniquement si fièvre"
    },
    "correct": "B",
    "rationale": "L''hospitalisation est indiquée si crise sévère, DEP<50% de la théorique, ou absence d''amélioration après traitement initial."
  }
]'
WHERE id = 'case-004';

-- Case 005: Lombalgies communes
UPDATE clinical_cases SET questions = '[
  {
    "q": "Quels red flags rechercher ?",
    "options": {
      "A": "Aucun nécessaire",
      "B": "Fièvre + Perte de poids + Déficit neurologique + Trouble sphinctérien",
      "C": "Uniquement l''intensité de la douleur",
      "D": "Antécédents familiaux"
    },
    "correct": "B",
    "rationale": "Les red flags (fièvre, perte de poids, déficit neuro, troubles sphinctériens) évoquent une lombalgie symptomatique nécessitant des examens."
  },
  {
    "q": "Quelle prise en charge initiale ?",
    "options": {
      "A": "Repos strict au lit",
      "B": "Antalgiques + Maintien de l''activité + Rassurance",
      "C": "IRM systématique",
      "D": "Infiltrations immédiates"
    },
    "correct": "B",
    "rationale": "La lombalgie commune nécessite des antalgiques, maintien de l''activité (repos strict contre-indiqué) et rassurance selon HAS."
  },
  {
    "q": "Quand demander une imagerie ?",
    "options": {
      "A": "Systématiquement",
      "B": "Uniquement si red flags ou pas d''amélioration après 4-6 semaines",
      "C": "Après 1 semaine",
      "D": "Jamais"
    },
    "correct": "B",
    "rationale": "L''imagerie n''est indiquée que si red flags présents ou absence d''amélioration après 4-6 semaines de traitement bien conduit."
  }
]'
WHERE id = 'case-005';
