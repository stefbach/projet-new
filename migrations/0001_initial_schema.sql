-- Tibok Medical Evaluation Database Schema
-- Cloudflare D1 (SQLite)

-- Table: doctors
CREATE TABLE IF NOT EXISTS doctors (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT,
  license_number TEXT,
  status TEXT CHECK (status IN ('active', 'suspended', 'under_review')) DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: doctors_evaluations
CREATE TABLE IF NOT EXISTS doctors_evaluations (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  qcm_score INTEGER CHECK (qcm_score >= 0 AND qcm_score <= 100),
  clinical_cases_score INTEGER CHECK (clinical_cases_score >= 0 AND clinical_cases_score <= 100),
  ai_audit_score INTEGER CHECK (ai_audit_score >= 0 AND ai_audit_score <= 100),
  tmcq_total INTEGER CHECK (tmcq_total >= 0 AND tmcq_total <= 100),
  status TEXT CHECK (status IN ('apte', 'supervision', 'formation_requise')),
  evaluation_date TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: consultations_audit
CREATE TABLE IF NOT EXISTS consultations_audit (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  consultation_id TEXT,
  patient_age INTEGER,
  patient_sex TEXT,
  chief_complaint TEXT,
  raw_transcript TEXT,
  ai_output TEXT, -- JSON stored as TEXT
  anamnese_score INTEGER,
  diagnostic_score INTEGER,
  prescription_score INTEGER,
  red_flags_score INTEGER,
  communication_score INTEGER,
  global_score INTEGER,
  flagged INTEGER DEFAULT 0, -- 0 = false, 1 = true
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: alerts_doctors
CREATE TABLE IF NOT EXISTS alerts_doctors (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('low_score', 'red_flag_missed', 'non_compliance', 'prescription_error')),
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved INTEGER DEFAULT 0, -- 0 = false, 1 = true
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Table: generated_qcm
CREATE TABLE IF NOT EXISTS generated_qcm (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON stored as TEXT
  correct_answer TEXT NOT NULL,
  justification TEXT,
  source TEXT,
  tags TEXT, -- JSON array stored as TEXT
  used_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table: clinical_cases
CREATE TABLE IF NOT EXISTS clinical_cases (
  id TEXT PRIMARY KEY,
  specialty TEXT NOT NULL,
  complexity TEXT CHECK (complexity IN ('simple', 'intermediate', 'complex')),
  title TEXT NOT NULL,
  patient_profile TEXT, -- JSON stored as TEXT
  presentation TEXT NOT NULL,
  anamnesis TEXT, -- JSON stored as TEXT
  questions TEXT, -- JSON stored as TEXT
  red_flags TEXT, -- JSON stored as TEXT
  diagnosis TEXT,
  management TEXT,
  prescription TEXT, -- JSON stored as TEXT
  source TEXT,
  used_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Table: doctor_qcm_attempts
CREATE TABLE IF NOT EXISTS doctor_qcm_attempts (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  qcm_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct INTEGER, -- 0 = false, 1 = true
  time_taken_seconds INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (qcm_id) REFERENCES generated_qcm(id) ON DELETE CASCADE
);

-- Table: doctor_case_attempts
CREATE TABLE IF NOT EXISTS doctor_case_attempts (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  answers TEXT, -- JSON stored as TEXT
  score INTEGER,
  feedback TEXT, -- JSON stored as TEXT
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES clinical_cases(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_doctor ON doctors_evaluations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON doctors_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations_audit(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_flagged ON consultations_audit(flagged) WHERE flagged = 1;
CREATE INDEX IF NOT EXISTS idx_consultations_severity ON consultations_audit(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_doctor ON alerts_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts_doctors(resolved) WHERE resolved = 0;
CREATE INDEX IF NOT EXISTS idx_qcm_topic ON generated_qcm(topic);
CREATE INDEX IF NOT EXISTS idx_qcm_difficulty ON generated_qcm(difficulty);
CREATE INDEX IF NOT EXISTS idx_cases_specialty ON clinical_cases(specialty);
CREATE INDEX IF NOT EXISTS idx_attempts_doctor ON doctor_qcm_attempts(doctor_id);
