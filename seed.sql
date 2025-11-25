-- Tibok Medical Evaluation - Seed Data
-- Données de test pour développement

-- Insertion de médecins de test
INSERT OR IGNORE INTO doctors (id, email, name, specialty, license_number, status, created_at)
VALUES 
  ('doc-001', 'dr.jean.martin@tibok.mu', 'Dr. Jean Martin', 'Médecine Générale', 'MMC-2020-1234', 'active', datetime('now')),
  ('doc-002', 'dr.marie.dubois@tibok.mu', 'Dr. Marie Dubois', 'Cardiologie', 'MMC-2019-5678', 'active', datetime('now')),
  ('doc-003', 'dr.paul.leroy@tibok.mu', 'Dr. Paul Leroy', 'Endocrinologie', 'MMC-2021-9012', 'active', datetime('now'));

-- Insertion de QCM de base (exemples basés sur OMS guidelines)

-- QCM Hypertension (WHO 2021)
INSERT OR IGNORE INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, tags, used_count, created_at)
VALUES
(
  'qcm-001',
  'Hypertension',
  'Cardiovascular',
  'intermediate',
  'Patient de 55 ans, HTA non contrôlée à 165/95 mmHg malgré traitement par Amlodipine 10mg. Quelle est la meilleure option thérapeutique selon WHO guidelines 2021 ?',
  '{"A": "Augmenter Amlodipine à 20mg", "B": "Ajouter un IEC (Lisinopril 10mg)", "C": "Remplacer par Beta-bloquant", "D": "Ajouter un diurétique thiazidique"}',
  'B',
  'Selon WHO Hypertension Guidelines 2021, en cas d''HTA non contrôlée sous monothérapie, la bithérapie recommandée associe un inhibiteur calcique (Amlodipine) + IEC ou ARA2. L''ajout d''un IEC comme le Lisinopril est le choix optimal.',
  'WHO Hypertension Guidelines 2021, Chapter 3 - Pharmacological Treatment',
  '["cardiovascular", "first-line-treatment", "hypertension"]',
  0,
  datetime('now')
),
(
  'qcm-002',
  'Hypertension',
  'Cardiovascular',
  'basic',
  'Quelle est la définition de l''hypertension artérielle selon l''OMS ?',
  '{"A": "PAS ≥ 130 mmHg ou PAD ≥ 80 mmHg", "B": "PAS ≥ 140 mmHg ou PAD ≥ 90 mmHg", "C": "PAS ≥ 150 mmHg ou PAD ≥ 95 mmHg", "D": "PAS ≥ 160 mmHg ou PAD ≥ 100 mmHg"}',
  'B',
  'L''OMS définit l''hypertension artérielle comme une PAS ≥ 140 mmHg et/ou une PAD ≥ 90 mmHg, mesurée lors de consultations répétées.',
  'WHO Hypertension Guidelines 2021, Definition',
  '["cardiovascular", "definition", "hypertension"]',
  0,
  datetime('now')
);

-- QCM Diabète (IDF 2024)
INSERT OR IGNORE INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, tags, used_count, created_at)
VALUES
(
  'qcm-003',
  'Diabète Type 2',
  'Endocrinology',
  'intermediate',
  'Patient diabétique type 2, HbA1c 9.5% sous Metformine 2g/j. Quelle est la meilleure option de deuxième ligne selon IDF 2024 ?',
  '{"A": "Augmenter Metformine à 3g/j", "B": "Ajouter Glibenclamide", "C": "Ajouter un inhibiteur SGLT2 ou agoniste GLP-1", "D": "Insuline basale immédiate"}',
  'C',
  'Selon IDF Diabetes Atlas 2024, en cas d''échec de la Metformine, les inhibiteurs SGLT2 ou agonistes GLP-1 sont recommandés en deuxième ligne pour leur efficacité et bénéfice cardiovasculaire.',
  'IDF Diabetes Atlas 2024, Treatment Algorithm',
  '["diabetes", "second-line-treatment", "endocrinology"]',
  0,
  datetime('now')
),
(
  'qcm-004',
  'Diabète',
  'Endocrinology',
  'basic',
  'Quelle est la cible d''HbA1c pour la plupart des patients diabétiques type 2 selon IDF ?',
  '{"A": "< 6.0%", "B": "< 7.0%", "C": "< 8.0%", "D": "< 9.0%"}',
  'B',
  'L''IDF recommande une cible d''HbA1c < 7.0% pour la plupart des patients diabétiques type 2 afin de prévenir les complications microvasculaires.',
  'IDF Diabetes Atlas 2024, Glycemic Targets',
  '["diabetes", "targets", "monitoring"]',
  0,
  datetime('now')
);

-- QCM Prescription WHO EML
INSERT OR IGNORE INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, tags, used_count, created_at)
VALUES
(
  'qcm-005',
  'Prescription',
  'Pharmacology',
  'intermediate',
  'Quel antibiotique de la WHO Essential Medicines List est recommandé en première intention pour une pneumonie communautaire ?',
  '{"A": "Azithromycine", "B": "Amoxicilline", "C": "Ciprofloxacine", "D": "Doxycycline"}',
  'B',
  'Selon WHO EML 2023, l''Amoxicilline est l''antibiotique de première intention pour les pneumonies communautaires non compliquées. Elle fait partie des Access antibiotics.',
  'WHO Essential Medicines List 2023, Section 6.2 - Antibacterials',
  '["prescription", "antibiotics", "respiratory"]',
  0,
  datetime('now')
);

-- QCM Téléconsultation
INSERT OR IGNORE INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, tags, used_count, created_at)
VALUES
(
  'qcm-006',
  'Téléconsultation',
  'Telemedicine',
  'intermediate',
  'Selon WHO Digital Health Guidelines, quelle situation constitue une contre-indication absolue à la téléconsultation ?',
  '{"A": "Patient âgé de plus de 75 ans", "B": "Douleur thoracique aiguë avec dyspnée", "C": "Renouvellement d''ordonnance chronique", "D": "Suivi d''HTA stable"}',
  'B',
  'Les urgences médicales (douleur thoracique, dyspnée aiguë, AVC) nécessitent une prise en charge immédiate en présentiel et constituent une contre-indication absolue à la téléconsultation.',
  'WHO Digital Health Guidelines 2019, Safety Recommendations',
  '["telemedicine", "safety", "red-flags"]',
  0,
  datetime('now')
);

-- Insertion d'un cas clinique exemple
INSERT OR IGNORE INTO clinical_cases (id, specialty, complexity, title, patient_profile, presentation, anamnesis, questions, red_flags, diagnosis, management, prescription, source, used_count, created_at)
VALUES
(
  'case-001',
  'Cardiologie',
  'intermediate',
  'HTA non contrôlée chez patient diabétique',
  '{"age": 58, "sex": "M", "location": "Maurice", "background": "Diabète type 2 depuis 8 ans, HTA depuis 3 ans"}',
  'Patient de 58 ans consulte en téléconsultation pour contrôle de son HTA. Se plaint de céphalées matinales depuis 2 semaines.',
  '["HTA diagnostiquée il y a 3 ans, traitement par Amlodipine 5mg", "Diabète type 2 sous Metformine 1g x2/j", "Céphalées matinales, pas de troubles visuels", "PA mesurée à domicile: 165/98 mmHg", "Dernière HbA1c (1 mois): 7.8%"]',
  '[{"q": "Quelle est la première action à entreprendre ?", "options": {"A": "Augmenter Amlodipine à 10mg", "B": "Ajouter un IEC", "C": "Référer en urgence", "D": "Mesures hygiéno-diététiques seules"}, "correct": "B", "rationale": "Bithérapie IEC + inhibiteur calcique recommandée selon WHO"}]',
  '["Céphalées matinales (signe d''HTA sévère)", "Diabète associé (risque cardiovasculaire élevé)", "PA > 160/95 mmHg"]',
  'HTA non contrôlée chez patient diabétique',
  'Ajouter un IEC (Lisinopril 10mg), surveillance PA à 2 semaines, optimisation du contrôle glycémique',
  '{"who_eml_compliant": true, "medications": [{"name": "Lisinopril", "dosage": "10mg", "frequency": "1x/jour le matin", "duration": "Traitement continu", "route": "oral", "who_eml_code": "C09AA"}]}',
  'WHO Hypertension Guidelines 2021',
  0,
  datetime('now')
);
