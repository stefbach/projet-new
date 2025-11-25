# Clinical Governance Policy - Tibok Medical Evaluation

**Document de Référence**  
**Version** : 1.0  
**Date** : 2025-11-25  
**Applicable à** : Tous les médecins pratiquant la téléconsultation sur la plateforme TIBOK

---

## 1. OBJECTIFS DE QUALITÉ

### 1.1 Objectif principal
Garantir la qualité et la sécurité des soins délivrés en téléconsultation par l'évaluation continue des compétences médicales selon les standards internationaux OMS et les exigences du Medical Council of Mauritius.

### 1.2 Objectifs spécifiques
- Maintenir un niveau de compétence clinique ≥ 85% (score T-MCQ)
- Assurer la conformité aux guidelines OMS dans 100% des prescriptions
- Détecter et corriger les lacunes de formation dans les 30 jours
- Protéger les patients via détection automatique des red flags
- Promouvoir l'amélioration continue de la pratique médicale

---

## 2. CADRE RÉGLEMENTAIRE

### 2.1 Références légales et professionnelles
- **Medical Council of Mauritius** - Code of Professional Conduct (2023)
- **Medical Council of Mauritius** - Telemedicine Guidelines
- **WHO** - Hypertension Guidelines 2021
- **WHO** - Essential Medicines List 2023
- **WHO** - Digital Health Guidelines 2019
- **IDF** - Diabetes Atlas 2024
- **GINA** - Asthma Guidelines 2024

### 2.2 Obligations des médecins
Tout médecin exerçant sur TIBOK s'engage à :
- Maintenir ses compétences à jour
- Respecter les guidelines OMS dans ses prescriptions
- Participer aux évaluations régulières (QCM, cas cliniques)
- Accepter les audits IA de ses consultations
- Suivre les formations complémentaires si nécessaire

---

## 3. MÉTHODOLOGIE D'ÉVALUATION

### 3.1 Système de scoring T-MCQ

Le score T-MCQ (Tibok Medical Quality Composite) est calculé selon la formule pondérée suivante :

**T-MCQ = (Clinique × 0.40) + (Sécurité × 0.30) + (Prescription × 0.15) + (Documentation × 0.10) + (Communication × 0.05)**

#### Composants évalués

| Composant | Poids | Évaluation |
|-----------|-------|------------|
| **Compétence clinique** | 40% | QCM théoriques (60%) + Cas cliniques pratiques (40%) |
| **Sécurité (Red Flags)** | 30% | Détection des signes d'alarme via audit IA |
| **Prescription & guidelines** | 15% | Conformité WHO EML 2023, posologies, interactions |
| **Dossier médical** | 10% | Complétude anamnèse, traçabilité, qualité notes |
| **Communication** | 5% | Clarté explications, empathie, consentement éclairé |

### 3.2 Outils d'évaluation

#### A. QCM théoriques
- **Fréquence** : Mensuelle
- **Contenu** : 50 questions par session
- **Durée** : 90 minutes
- **Seuil de réussite** : 75% minimum
- **Sources** : Guidelines OMS/WHO actualisées

**Thématiques couvertes :**
- Hypertension (WHO 2021)
- Diabète (IDF 2024)
- Asthme/COPD (GINA 2024)
- Infectiologie tropicale
- Dermatologie courante
- Urgences & Red Flags
- Prescription WHO EML
- Téléconsultation (WHO Digital Health)
- Éthique médicale (Medical Council Mauritius)

#### B. Cas cliniques
- **Fréquence** : Bimensuelle
- **Format** : Cas progressifs avec questions SBA
- **Complexité** : Adaptée au niveau (simple, intermédiaire, complexe)
- **Seuil de réussite** : 70% minimum

#### C. Audit IA des consultations
- **Fréquence** : Continue (toutes les téléconsultations)
- **Technologie** : OpenAI GPT-4
- **Critères évalués** :
  - Complétude de l'anamnèse (HIDA)
  - Pertinence du diagnostic
  - Conformité de la prescription (WHO EML)
  - Détection des red flags
  - Qualité de la communication

**Scoring détaillé :**
```
- Anamnèse : /100 (complétude, pertinence, red flags recherchés)
- Diagnostic : /100 (examen adapté, diagnostic différentiel)
- Prescription : /100 (WHO EML, posologie, contre-indications)
- Red Flags : /100 (signes d'alarme détectés, orientation urgente)
- Communication : /100 (clarté, langage adapté, éducation thérapeutique)
```

---

## 4. CRITÈRES DE SCORING

### 4.1 Seuils de décision

| Score T-MCQ | Statut | Action |
|-------------|--------|--------|
| **≥ 85%** | **Apte** | Pratique autonome autorisée |
| **70-84%** | **Supervision** | Consultations supervisées pendant 3 mois |
| **< 70%** | **Formation requise** | Formation obligatoire + réévaluation |

### 4.2 Pénalités automatiques

| Situation | Pénalité | Conséquence |
|-----------|----------|-------------|
| Red flag non détecté | Score T-MCQ < 50% | Alerte critique immédiate |
| Prescription hors WHO EML | -30 points | Révision obligatoire |
| Orientation urgente manquée | Sévérité "high" | Supervision immédiate |
| Diagnostic sans examen | -30 points | Formation rappel obligatoire |

### 4.3 Alertes automatiques

Le système génère automatiquement des alertes dans les cas suivants :

**Alerte CRITIQUE (rouge)** :
- Red flag manqué (ex : douleur thoracique non référée)
- Prescription dangereuse (surdosage, contre-indication absolue)
- Score T-MCQ < 50%

**Alerte HAUTE (orange)** :
- Prescription hors WHO EML
- Score T-MCQ entre 50-69%
- Plusieurs erreurs diagnostiques

**Alerte MOYENNE (jaune)** :
- Score T-MCQ entre 70-74%
- Documentation incomplète
- Communication défaillante

---

## 5. PROCÉDURES DE SUPERVISION

### 5.1 Déclenchement de la supervision

La supervision est déclenchée automatiquement si :
- Score T-MCQ entre 70-84% pendant 2 évaluations consécutives
- Alerte critique générée
- 3 alertes moyennes ou hautes en 1 mois

### 5.2 Modalités de supervision

**Durée** : 3 mois minimum

**Actions** :
1. **Semaine 1-4** : Observation par médecin senior
   - Revue de 10 consultations/semaine
   - Feedback écrit après chaque revue
   - Identification des lacunes

2. **Semaine 5-8** : Formation ciblée
   - Modules e-learning personnalisés
   - Cas cliniques supervisés
   - Révision des guidelines

3. **Semaine 9-12** : Pratique supervisée
   - Consultations en binôme
   - Débriefing post-consultation
   - Audit continu

### 5.3 Critères de sortie de supervision

Pour sortir de supervision, le médecin doit :
- Obtenir un score T-MCQ ≥ 85% à la réévaluation
- Avoir 0 alerte critique pendant 1 mois
- Validation par le médecin superviseur

---

## 6. PROCÉDURE EN CAS DE PERFORMANCE INSUFFISANTE

### 6.1 Score T-MCQ < 70%

**Étape 1 : Suspension immédiate (24h)**
- Consultation avec le Directeur Médical
- Analyse des causes (fatigue, lacunes, burnout)
- Plan d'amélioration personnalisé (PAP)

**Étape 2 : Formation obligatoire (2-4 semaines)**
- Formation intensive sur les lacunes identifiées
- Modules obligatoires :
  - Guidelines OMS actualisées
  - Détection des red flags
  - Prescription WHO EML 2023
  - Communication en téléconsultation

**Étape 3 : Réévaluation (après formation)**
- QCM complet (100 questions)
- 5 cas cliniques complexes
- Seuil de réussite : 80%

**Résultats possibles :**
- **Réussite (≥ 80%)** → Retour pratique supervisée 3 mois
- **Échec (< 80%)** → Formation complémentaire + réévaluation
- **Échec répété (2x)** → Signalement au Medical Council of Mauritius

### 6.2 Red flags manqués répétés

En cas de red flags manqués > 2 fois en 3 mois :
- **Suspension immédiate** de la pratique téléconsultation
- **Formation urgente** sur les urgences médicales
- **Simulation** de cas urgents (10 cas)
- **Réévaluation stricte** avec observation directe

---

## 7. DROITS ET DEVOIRS DES MÉDECINS

### 7.1 Droits
- Accès à son dossier d'évaluation complet
- Explication détaillée de chaque pénalité
- Droit de recours en cas de désaccord
- Accès aux formations gratuites
- Confidentialité des évaluations

### 7.2 Devoirs
- Participer à toutes les évaluations obligatoires
- Accepter les audits IA de consultations
- Suivre les formations recommandées
- Maintenir ses compétences à jour
- Signaler toute difficulté technique ou clinique

### 7.3 Procédure de recours

En cas de désaccord avec une évaluation, le médecin peut :
1. **Demander une révision** (délai : 15 jours)
2. **Présenter son dossier** au Comité d'Évaluation
3. **Demander une contre-évaluation** par expert externe
4. **Saisir le Medical Council of Mauritius** en dernier recours

---

## 8. CONFIDENTIALITÉ ET PROTECTION DES DONNÉES

### 8.1 Données collectées
- Résultats QCM et cas cliniques
- Transcripts de consultations (anonymisés)
- Scores T-MCQ
- Alertes et incidents

### 8.2 Protection
- Stockage sécurisé Cloudflare D1
- Accès restreint (admin + médecin concerné uniquement)
- Anonymisation des données patients
- Conformité RGPD

### 8.3 Conservation
- Résultats d'évaluation : 5 ans
- Audits de consultation : 3 ans
- Alertes résolues : 1 an

---

## 9. AMÉLIORATION CONTINUE

### 9.1 Révision du système
- **Trimestrielle** : Analyse des données d'évaluation
- **Semestrielle** : Mise à jour des guidelines
- **Annuelle** : Révision complète de la politique

### 9.2 Indicateurs de suivi
- Score T-MCQ moyen de la plateforme
- Taux de médecins "Apte"
- Nombre d'alertes critiques
- Taux de participation aux évaluations

---

## 10. CONTACT ET SUPPORT

### Support technique
- Email : support-evaluation@tibok.mu
- Plateforme : Dashboard admin TIBOK

### Directeur Médical
- Dr. [Nom à compléter]
- Email : medical.director@tibok.mu

### Medical Council of Mauritius
- Website : https://medicalcouncil.mu
- Tel : +230 xxx xxxx

---

**Document approuvé par :**
- Directeur Médical TIBOK
- Comité d'Éthique
- Medical Council of Mauritius (référence guidelines)

**Prochaine révision prévue** : 2026-05-25
