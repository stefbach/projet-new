-- Add authentication fields to doctors table

ALTER TABLE doctors ADD COLUMN password_hash TEXT;
ALTER TABLE doctors ADD COLUMN role TEXT CHECK (role IN ('admin', 'doctor')) DEFAULT 'doctor';
ALTER TABLE doctors ADD COLUMN last_login TEXT;

-- Create sessions table for evaluation sessions
CREATE TABLE IF NOT EXISTS evaluation_sessions (
  id TEXT PRIMARY KEY,
  doctor_id TEXT NOT NULL,
  session_type TEXT CHECK (session_type IN ('qcm', 'clinical_cases', 'full')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  started_at TEXT,
  completed_at TEXT,
  qcm_score INTEGER,
  cases_score INTEGER,
  total_score INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_doctor ON evaluation_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON evaluation_sessions(status);
