// Tibok Medical Evaluation - Type Definitions

export type Bindings = {
  DB: D1Database
  OPENAI_API_KEY: string
  AI_PROVIDER: string
}

export interface Doctor {
  id: string
  email: string
  name: string
  specialty?: string
  license_number?: string
  status: 'active' | 'suspended' | 'under_review'
  created_at: string
  updated_at: string
}

export interface DoctorEvaluation {
  id: string
  doctor_id: string
  qcm_score: number
  clinical_cases_score: number
  ai_audit_score: number
  tmcq_total: number
  status: 'apte' | 'supervision' | 'formation_requise'
  evaluation_date: string
  created_at: string
}

export interface ConsultationAudit {
  id: string
  doctor_id: string
  consultation_id?: string
  patient_age?: number
  patient_sex?: string
  chief_complaint?: string
  raw_transcript: string
  ai_output: AIAuditOutput
  anamnese_score: number
  diagnostic_score: number
  prescription_score: number
  red_flags_score: number
  communication_score: number
  global_score: number
  flagged: boolean
  severity: 'low' | 'medium' | 'high'
  created_at: string
}

export interface AIAuditOutput {
  anamnese_score: number
  anamnese_details: {
    completeness: number
    pertinence: number
    red_flags_asked: boolean
  }
  diagnostic_score: number
  diagnostic_rationale: string
  prescription_score: number
  prescription_analysis: {
    who_eml_compliant: boolean
    dosage_correct: boolean
    contraindications_checked: boolean
  }
  red_flags_detected: string[]
  red_flags_missed: string[]
  communication_score: number
  global_tmcq_score: number
  recommendations: string[]
  requires_supervision: boolean
  severity: 'low' | 'medium' | 'high'
}

export interface Alert {
  id: string
  doctor_id: string
  alert_type: 'low_score' | 'red_flag_missed' | 'non_compliance' | 'prescription_error'
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolved_at?: string
  created_at: string
}

export interface QCM {
  id: string
  topic: string
  category: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  justification: string
  source: string
  tags: string[]
  used_count: number
  created_at: string
}

export interface ClinicalCase {
  id: string
  specialty: string
  complexity: 'simple' | 'intermediate' | 'complex'
  title: string
  patient_profile: {
    age: number
    sex: 'M' | 'F'
    location: string
    background?: string
  }
  presentation: string
  anamnesis: string[]
  questions: CaseQuestion[]
  red_flags: string[]
  diagnosis: string
  management: string
  prescription: Prescription
  source: string
  used_count: number
  created_at: string
}

export interface CaseQuestion {
  q: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct: 'A' | 'B' | 'C' | 'D'
  rationale: string
}

export interface Prescription {
  who_eml_compliant: boolean
  medications: Medication[]
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  route: string
  who_eml_code?: string
}

export interface GenerateQCMRequest {
  topic: string
  count: number
  difficulty: 'basic' | 'intermediate' | 'advanced'
  guidelines: string
}

export interface GenerateClinicalCaseRequest {
  specialty: string
  complexity: 'simple' | 'intermediate' | 'complex'
  patient_profile?: {
    age_range?: string
    sex?: 'M' | 'F'
    location?: string
  }
}

export interface EvaluateConsultationRequest {
  doctor_id: string
  consultation_id?: string
  transcript: string
  patient_age?: number
  patient_sex?: string
  chief_complaint?: string
}

export interface TMCQScore {
  clinical: number
  safety: number
  prescription: number
  documentation: number
  communication: number
  total: number
  status: 'apte' | 'supervision' | 'formation_requise'
}
