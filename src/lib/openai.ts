// Tibok Medical Evaluation - OpenAI Integration

import type { QCM, ClinicalCase, AIAuditOutput } from '../types/medical'

export class OpenAIService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async callOpenAI(messages: any[], responseFormat: 'json_object' | 'text' = 'json_object', temperature = 0.7) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages,
        response_format: { type: responseFormat },
        temperature
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`)
    }

    return await response.json()
  }

  async generateQCM(topic: string, count: number, difficulty: string, guidelines: string): Promise<QCM[]> {
    const systemPrompt = `Tu es un expert médical certifié par l'OMS et le Medical Council of Mauritius.
Génère ${count} QCM de difficulté ${difficulty} sur ${topic}.
Base-toi UNIQUEMENT sur ${guidelines}.

Format JSON strict :
{
  "questions": [
    {
      "topic": "...",
      "category": "...",
      "difficulty": "basic|intermediate|advanced",
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "correct_answer": "A|B|C|D",
      "justification": "Explication clinique détaillée",
      "source": "WHO EML 2023, page X ou guideline spécifique",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Règles strictes :
- Ne JAMAIS inventer de sources
- Utiliser uniquement des guidelines vérifiables (OMS, WHO EML, GINA, IDF, Medical Council Mauritius)
- Questions cliniquement pertinentes pour Maurice
- Inclure des cas tropicaux si pertinent
- Justifications basées sur evidence-based medicine`

    const userPrompt = `Génère ${count} QCM cliniques sur ${topic}, difficulté ${difficulty}.
Guidelines de référence : ${guidelines}`

    const data = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const result = JSON.parse(data.choices[0].message.content)
    return result.questions.map((q: any) => ({
      id: crypto.randomUUID(),
      ...q,
      used_count: 0,
      created_at: new Date().toISOString()
    }))
  }

  async generateClinicalCase(specialty: string, complexity: string, count: number = 1, patientProfile?: any): Promise<ClinicalCase[]> {
    const systemPrompt = `Tu es un expert médical spécialisé en ${specialty}.
Génère ${count} cas cliniques réalistes de complexité ${complexity}.

Structure obligatoire JSON :
{
  "cases": [
    {
      "specialty": "...",
      "complexity": "simple|intermediate|complex",
      "title": "Titre court du cas",
      "patient_profile": {
        "age": number,
        "sex": "M|F",
        "location": "Maurice|Rodrigues",
        "background": "Antécédents pertinents"
      },
      "presentation": "Motif de consultation et histoire",
      "anamnesis": {
        "chief_complaint": "...",
        "history": "...",
        "past_medical_history": "..."
      },
      "questions": [
        {
          "q": "Question clinique",
          "options": {
            "A": "...",
            "B": "...",
            "C": "...",
            "D": "..."
          },
          "correct": "A|B|C|D",
          "rationale": "Justification"
        }
      ],
      "red_flags": ["Red flag 1", "Red flag 2"],
      "diagnosis": "Diagnostic principal",
      "management": "Conduite à tenir selon guidelines OMS",
      "prescription": {
        "who_eml_compliant": true,
        "medications": [
          {
            "name": "Nom DCI",
            "dosage": "...",
            "frequency": "...",
            "duration": "...",
            "route": "oral|IM|IV"
          }
        ]
      },
      "source": "WHO Guideline ou référence OMS vérifiable"
    }
  ]
}

Contexte Maurice :
- Prévalence élevée : diabète, HTA, maladies cardiovasculaires
- Pathologies tropicales : dengue, chikungunya, leptospirose
- Système de santé : téléconsultation, accès limité aux spécialistes
- Respect strict des guidelines OMS et WHO Essential Medicines List 2023

IMPORTANT : Génère exactement ${count} cas cliniques DIFFÉRENTS et VARIÉS.`

    const userPrompt = `Génère ${count} cas cliniques en ${specialty}, complexité ${complexity}.
${patientProfile ? `Profil patient souhaité : ${JSON.stringify(patientProfile)}` : ''}
Assure-toi que chaque cas soit unique et couvre différents aspects de la spécialité.`

    const data = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ])

    const result = JSON.parse(data.choices[0].message.content)
    return result.cases.map((clinicalCase: any) => ({
      id: crypto.randomUUID(),
      ...clinicalCase,
      used_count: 0,
      created_at: new Date().toISOString()
    }))
  }

  async evaluateConsultation(transcript: string, patientInfo?: any): Promise<AIAuditOutput> {
    const systemPrompt = `Tu es un auditeur médical certifié selon Medical Council of Mauritius Code of Practice 2023.

Analyse cette téléconsultation et retourne un JSON strict :
{
  "anamnese_score": 0-100,
  "anamnese_details": {
    "completeness": 0-100,
    "pertinence": 0-100,
    "red_flags_asked": true|false
  },
  "diagnostic_score": 0-100,
  "diagnostic_rationale": "Justification du score",
  "prescription_score": 0-100,
  "prescription_analysis": {
    "who_eml_compliant": true|false,
    "dosage_correct": true|false,
    "contraindications_checked": true|false
  },
  "red_flags_detected": ["Liste des red flags détectés"],
  "red_flags_missed": ["Liste des red flags non recherchés"],
  "communication_score": 0-100,
  "global_tmcq_score": 0-100,
  "recommendations": ["Recommandation 1", "Recommandation 2"],
  "requires_supervision": true|false,
  "severity": "low|medium|high"
}

Critères d'évaluation stricts :
1. ANAMNÈSE (0-100)
   - Motif de consultation clair
   - HIDA complet (Histoire, Interrogatoire, Douleur, Antécédents)
   - Red flags recherchés
   - Facteurs de risque identifiés

2. DIAGNOSTIC (0-100)
   - Examen clinique adapté
   - Diagnostic différentiel
   - Critères diagnostiques respectés
   - Conformité aux guidelines OMS

3. PRESCRIPTION (0-100)
   - WHO EML 2023 compliance
   - Posologie correcte
   - Contre-indications vérifiées
   - Interactions médicamenteuses

4. RED FLAGS (0-100)
   - Signes d'alarme recherchés
   - Orientation urgente si nécessaire
   - Sécurité patient

5. COMMUNICATION (0-100)
   - Clarté des explications
   - Langage adapté
   - Éducation thérapeutique
   - Consentement éclairé

Pénalités :
- Absence de question sur red flag : score < 50
- Prescription hors WHO EML : alerte immédiate
- Diagnostic sans examen : -30 points
- Orientation urgente manquée : severity = "high"

Score T-MCQ calculé selon :
- Compétence clinique : 40%
- Sécurité (Red Flags) : 30%
- Prescription & guidelines : 15%
- Dossier médical : 10%
- Communication : 5%`

    const userPrompt = `Analyse cette téléconsultation :

${patientInfo ? `Informations patient : ${JSON.stringify(patientInfo)}\n\n` : ''}
Transcript de la consultation :
${transcript}

Évalue selon les critères du Medical Council of Mauritius et les guidelines OMS.`

    const data = await this.callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 'json_object', 0.3) // Temperature basse pour évaluation stricte

    return JSON.parse(data.choices[0].message.content)
  }
}
