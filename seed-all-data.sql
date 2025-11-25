-- Complete seed script for Tibok Medical Database
-- SHA-256 hash for 'password123': ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- 1. Insert doctors
INSERT OR REPLACE INTO doctors (id, email, name, specialty, license_number, role, status, password_hash, created_at)
VALUES 
  ('doc-001', 'dr.jean.martin@tibok.mu', 'Dr. Jean Martin', 'Médecine Générale', 'MU2024001', 'doctor', 'active', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', datetime('now')),
  ('doc-002', 'dr.marie.dubois@tibok.mu', 'Dr. Marie Dubois', 'Pédiatrie', 'MU2024002', 'doctor', 'active', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', datetime('now')),
  ('doc-003', 'dr.paul.leroy@tibok.mu', 'Dr. Paul Leroy', 'Cardiologie', 'MU2024003', 'doctor', 'active', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', datetime('now')),
  ('doc-004', 'dr.test@tibok.mu', 'Dr. Test Medical', 'Urgences', 'MU2024004', 'doctor', 'active', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', datetime('now')),
  ('admin-001', 'admin@tibok.mu', 'Admin Tibok', 'Administration', 'MU2024999', 'admin', 'active', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', datetime('now'));

-- 2. Insert sample QCMs (13 QCMs with diverse topics)
INSERT OR REPLACE INTO generated_qcm (id, topic, category, difficulty, question, options, correct_answer, justification, source, created_at)
VALUES 
  ('qcm-001', 'Hypertension', 'Cardiovascular', 'intermediate', 
   'Patient de 55 ans, HTA non contrôlée à 165/95 mmHg malgré traitement par Amlodipine 10mg. Quelle est la meilleure option thérapeutique selon WHO guidelines 2021 ?',
   '["A) Augmenter Amlodipine à 20mg", "B) Ajouter un IEC (Lisinopril 10mg)", "C) Remplacer par Beta-bloquant", "D) Ajouter un diurétique thiazidique", "E) Arrêter tous les médicaments"]',
   'B',
   'Selon les directives WHO Hypertension Guidelines 2021, la bithérapie recommandée pour HTA non contrôlée sous monothérapie est un inhibiteur calcique (Amlodipine) + IEC ou ARA2, d''où Lisinopril est le choix optimal.',
   'WHO Hypertension Guidelines 2021, Chapter 3 - Pharmacological Treatment',
   datetime('now')),
   
  ('qcm-002', 'Diabetes', 'Endocrinology', 'basic',
   'Quel est le critère diagnostique du diabète selon l''ADA 2023 ?',
   '["A) Glycémie à jeun ≥ 7.0 mmol/L", "B) HbA1c ≥ 6.0%", "C) Glycémie postprandiale ≥ 10.0 mmol/L", "D) Insulinémie élevée", "E) Peptide C bas"]',
   'A',
   'L''ADA définit le diabète par une glycémie à jeun ≥ 7.0 mmol/L (126 mg/dL) à deux reprises, ou HbA1c ≥ 6.5%.',
   'ADA Standards of Care 2023',
   datetime('now')),
   
  ('qcm-003', 'COVID-19', 'Infectious Disease', 'intermediate',
   'Patient COVID-19+ avec SpO2 92% en air ambiant. Quelle est la prise en charge ?',
   '["A) Observation à domicile", "B) Oxygénothérapie + Dexamethasone 6mg", "C) Intubation immédiate", "D) Antibiotiques seuls", "E) Antiviraux seuls"]',
   'B',
   'SpO2 <94% indique une hypoxémie nécessitant oxygénothérapie et corticothérapie (Dexamethasone 6mg/j) selon WHO COVID-19 Guidelines.',
   'WHO COVID-19 Treatment Guidelines',
   datetime('now')),
   
  ('qcm-004', 'Pediatrics', 'Pediatrics', 'basic',
   'À quel âge introduit-on les aliments solides chez le nourrisson selon OMS ?',
   '["A) 3 mois", "B) 4 mois", "C) 6 mois", "D) 9 mois", "E) 12 mois"]',
   'C',
   'L''OMS recommande l''introduction des aliments de complément à partir de 6 mois, avec maintien de l''allaitement.',
   'OMS - Alimentation du nourrisson',
   datetime('now')),
   
  ('qcm-005', 'Cardiology', 'Cardiovascular', 'advanced',
   'Patient avec IDM STEMI antérieur. Délai optimal pour angioplastie primaire selon ESC 2023 ?',
   '["A) <60 minutes", "B) <90 minutes", "C) <120 minutes", "D) <6 heures", "E) <24 heures"]',
   'C',
   'ESC Guidelines 2023 recommandent angioplastie primaire dans les 120 minutes après premier contact médical pour STEMI.',
   'ESC STEMI Guidelines 2023',
   datetime('now')),
   
  ('qcm-006', 'Dermatology', 'Dermatology', 'intermediate',
   'Lésion pigmentée avec ABCDE positifs. Conduite à tenir ?',
   '["A) Surveillance simple", "B) Cryothérapie", "C) Exérèse-biopsie totale", "D) Antibiotiques locaux", "E) Corticoïdes"]',
   'C',
   'Critères ABCDE évocateurs de mélanome nécessitent exérèse-biopsie complète avec marge pour analyse histologique.',
   'Dermatology Guidelines - Melanoma',
   datetime('now')),
   
  ('qcm-007', 'Psychiatry', 'Psychiatry', 'intermediate',
   'Patient avec épisode dépressif majeur. Traitement de première ligne selon NICE ?',
   '["A) Psychothérapie seule", "B) ISRS (Sertraline)", "C) Benzodiazépines", "D) Antipsychotiques", "E) Lithium"]',
   'B',
   'NICE Guidelines recommandent ISRS comme traitement pharmacologique de 1ère ligne, associé à la psychothérapie.',
   'NICE Depression Guidelines',
   datetime('now')),
   
  ('qcm-008', 'Gynecology', 'Gynecology', 'basic',
   'Contraception d''urgence : délai maximal pour lévonorgestrel ?',
   '["A) 24h", "B) 48h", "C) 72h", "D) 5 jours", "E) 7 jours"]',
   'C',
   'Le lévonorgestrel (Plan B) est efficace jusqu''à 72h après rapport non protégé, avec efficacité décroissante.',
   'WHO Contraception Guidelines',
   datetime('now')),
   
  ('qcm-009', 'Endocrinology', 'Endocrinology', 'advanced',
   'Hyperthyroïdie avec TSH <0.01, T4 élevée. Étiologie la plus fréquente ?',
   '["A) Maladie de Basedow", "B) Adénome toxique", "C) Thyroïdite", "D) Hypophyse", "E) Médicaments"]',
   'A',
   'La maladie de Basedow (auto-immune avec anticorps anti-RTSH) est la cause la plus fréquente d''hyperthyroïdie primaire.',
   'Thyroid Disease Guidelines',
   datetime('now')),
   
  ('qcm-010', 'Pneumology', 'Respiratory', 'intermediate',
   'BPCO Gold 3, dyspnée mMRC 3. Traitement optimal ?',
   '["A) LABA seul", "B) LABA + LAMA", "C) Corticoïdes inhalés seuls", "D) Antibiotiques au long cours", "E) Oxygène 24h/24"]',
   'B',
   'GOLD Guidelines recommandent bithérapie LABA+LAMA pour BPCO Gold 3 symptomatique avant d''ajouter corticoïdes.',
   'GOLD COPD Guidelines 2023',
   datetime('now')),

  ('qcm-011', 'Gastroenterology', 'Gastroenterology', 'intermediate',
   'Reflux gastro-oesophagien résistant aux IPP. Examen de référence ?',
   '["A) Radiographie", "B) pH-métrie oesophagienne 24h", "C) Scanner", "D) Échographie", "E) IRM"]',
   'B',
   'La pH-métrie oesophagienne 24h est l''examen de référence pour confirmer et quantifier le RGO résistant aux IPP.',
   'ACG Guidelines - GERD',
   datetime('now')),

  ('qcm-012', 'Rheumatology', 'Rheumatology', 'advanced',
   'Polyarthrite rhumatoïde débutante. Critères ACR/EULAR 2010 : score minimal ?',
   '["A) ≥4", "B) ≥6", "C) ≥8", "D) ≥10", "E) ≥12"]',
   'B',
   'Les critères ACR/EULAR 2010 nécessitent un score ≥6/10 pour diagnostiquer une polyarthrite rhumatoïde.',
   'ACR/EULAR RA Criteria 2010',
   datetime('now')),

  ('qcm-013', 'Neurology', 'Neurology', 'intermediate',
   'AVC ischémique <4.5h. Traitement thrombolytique de référence ?',
   '["A) Aspirine IV", "B) Héparine", "C) rt-PA (Alteplase)", "D) Clopidogrel", "E) Warfarine"]',
   'C',
   'Le rt-PA (Alteplase) en IV est le traitement de référence pour AVC ischémique dans les 4.5 premières heures.',
   'AHA/ASA Stroke Guidelines',
   datetime('now'));

-- 3. Insert sample clinical cases (5 cases)
INSERT OR REPLACE INTO clinical_cases (id, specialty, complexity, title, presentation, anamnesis, questions, diagnosis, management, source, created_at)
VALUES 
  ('case-001', 'Médecine Générale', 'intermediate',
   'Douleur thoracique aiguë',
   'Homme de 58 ans consulte pour douleur thoracique rétrosternale depuis 2h, irradiant au bras gauche, avec sueurs.',
   'ATCD: HTA, tabac 30 PA, dyslipidémie. Douleur constrictive 8/10, apparue au repos. Pas de dyspnée.',
   '[{"question": "Quelle est votre hypothèse diagnostique principale ?", "answer": "Syndrome coronarien aigu (SCA)", "points": 2}, {"question": "Quels examens demandez-vous en urgence ?", "answer": "ECG, Troponine, Bilan complet", "points": 2}, {"question": "Quelle est la prise en charge immédiate ?", "answer": "Aspirine 300mg, Monitoring, Angioplastie", "points": 3}]',
   'Syndrome coronarien aigu STEMI',
   'Présentation typique de SCA avec facteurs de risque CV. ECG confirmerait sus-décalage ST. Angioplastie primaire <120min selon ESC.',
   'ESC STEMI Guidelines 2023',
   datetime('now')),

  ('case-002', 'Pédiatrie', 'simple',
   'Fièvre et éruption chez l''enfant',
   'Enfant de 4 ans, fièvre 39.5°C depuis 3j, éruption maculopapuleuse généralisée, conjonctivite bilatérale.',
   'Vaccination à jour. Fréquente la crèche. Pas de toux. Exanthème débuté derrière les oreilles puis généralisé.',
   '[{"question": "Quel est le diagnostic le plus probable ?", "answer": "Rougeole", "points": 3}, {"question": "Quelle complication recherchez-vous ?", "answer": "Pneumopathie, Encéphalite", "points": 2}, {"question": "Conduite à tenir ?", "answer": "Isolement, Surveillance, Déclaration obligatoire", "points": 2}]',
   'Rougeole',
   'Tableau clinique typique : fièvre + exanthème cranio-caudal + conjonctivite. Maladie à déclaration obligatoire.',
   'OMS - Rougeole Guidelines',
   datetime('now')),

  ('case-003', 'Cardiologie', 'complex',
   'Insuffisance cardiaque décompensée',
   'Femme de 72 ans, dyspnée classe IV NYHA, orthopnée, OMI, prise de poids 5kg en 1 semaine.',
   'ATCD: IC chronique (FEVG 30%), FA, HTA. Traitement: Furosémide, Ramipril, Bisoprolol. Non observance récente.',
   '[{"question": "Quel est le mécanisme de décompensation ?", "answer": "Surcharge volumique par non-observance", "points": 2}, {"question": "Traitement en urgence ?", "answer": "Furosémide IV, Surveillance diurèse, Bilan", "points": 3}, {"question": "Optimisation du traitement chronique ?", "answer": "Éducation, Sacubitril/Valsartan, Spironolactone", "points": 2}]',
   'Insuffisance cardiaque décompensée',
   'Décompensation par non-observance thérapeutique. Traitement: diurétiques IV puis optimisation selon ESC Guidelines.',
   'ESC Heart Failure Guidelines 2021',
   datetime('now')),

  ('case-004', 'Urgences', 'intermediate',
   'Crise d''asthme aiguë',
   'Homme de 35 ans, dyspnée intense, wheezing bilatéral, utilisation muscles accessoires, DEP 40% théorique.',
   'Asthme connu mal contrôlé, infection respiratoire depuis 2j, utilisé 10 bouffées de Ventolin sans amélioration.',
   '[{"question": "Évaluation de la sévérité ?", "answer": "Asthme aigu sévère (DEP <50%)", "points": 2}, {"question": "Traitement immédiat ?", "answer": "O2, Salbutamol nébulisé, Corticoïdes systémiques", "points": 3}, {"question": "Critères d''hospitalisation ?", "answer": "Pas d''amélioration, DEP <50%, Hypoxémie", "points": 2}]',
   'Asthme aigu sévère',
   'Exacerbation sévère nécessitant traitement agressif: bronchodilatateurs + corticoïdes systémiques selon GINA Guidelines.',
   'GINA Guidelines 2023',
   datetime('now')),

  ('case-005', 'Médecine Générale', 'simple',
   'Lombalgies communes',
   'Homme de 42 ans, lombalgie depuis 5j après port de charges, sans irradiation, pas de déficit moteur.',
   'Travaille comme déménageur. Douleur mécanique, améliorée au repos. Pas de fièvre, pas de perte de poids.',
   '[{"question": "Quel type de lombalgie ?", "answer": "Lombalgie commune mécanique", "points": 2}, {"question": "Examens complémentaires nécessaires ?", "answer": "Aucun (Red flags absents)", "points": 2}, {"question": "Prise en charge ?", "answer": "Antalgiques, Maintien activité, Pas de repos strict", "points": 3}]',
   'Lombalgie commune',
   'Lombalgie mécanique sans red flags: pas d''imagerie nécessaire. Traitement symptomatique + maintien activité.',
   'HAS - Lombalgie',
   datetime('now'));

-- 4. Create evaluation template
INSERT OR REPLACE INTO evaluation_templates (id, name, description, duration_minutes, passing_score, is_active, created_at)
VALUES (
  'eval-test-001',
  'Évaluation Médicale Générale - Test',
  'Évaluation de démonstration avec 10 QCM et 3 cas cliniques pour tester le système complet',
  60,
  70.0,
  1,
  datetime('now')
);

-- 5. Add first 10 QCM to the template
INSERT OR REPLACE INTO evaluation_template_qcm (template_id, qcm_id, order_index, weight)
VALUES 
  ('eval-test-001', 'qcm-001', 0, 1.0),
  ('eval-test-001', 'qcm-002', 1, 1.0),
  ('eval-test-001', 'qcm-003', 2, 1.0),
  ('eval-test-001', 'qcm-004', 3, 1.0),
  ('eval-test-001', 'qcm-005', 4, 1.0),
  ('eval-test-001', 'qcm-006', 5, 1.0),
  ('eval-test-001', 'qcm-007', 6, 1.0),
  ('eval-test-001', 'qcm-008', 7, 1.0),
  ('eval-test-001', 'qcm-009', 8, 1.0),
  ('eval-test-001', 'qcm-010', 9, 1.0);

-- 6. Add first 3 clinical cases to the template
INSERT OR REPLACE INTO evaluation_template_cases (template_id, case_id, order_index, weight)
VALUES 
  ('eval-test-001', 'case-001', 0, 2.0),
  ('eval-test-001', 'case-002', 1, 2.0),
  ('eval-test-001', 'case-003', 2, 2.0);

SELECT 'Database fully seeded: 5 doctors, 13 QCMs, 5 clinical cases, 1 active evaluation' as message;
