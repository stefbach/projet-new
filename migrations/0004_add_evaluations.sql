-- Table pour les modèles d'évaluation (templates créés par l'admin)
CREATE TABLE IF NOT EXISTS evaluation_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  passing_score REAL NOT NULL DEFAULT 75.0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison entre évaluations et QCM
CREATE TABLE IF NOT EXISTS evaluation_template_qcm (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id TEXT NOT NULL,
  qcm_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  weight REAL NOT NULL DEFAULT 1.0,
  FOREIGN KEY (template_id) REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (qcm_id) REFERENCES generated_qcm(id) ON DELETE CASCADE
);

-- Table de liaison entre évaluations et cas cliniques
CREATE TABLE IF NOT EXISTS evaluation_template_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id TEXT NOT NULL,
  case_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  weight REAL NOT NULL DEFAULT 2.0,
  FOREIGN KEY (template_id) REFERENCES evaluation_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES clinical_cases(id) ON DELETE CASCADE
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_eval_templates_active ON evaluation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_eval_qcm_template ON evaluation_template_qcm(template_id);
CREATE INDEX IF NOT EXISTS idx_eval_cases_template ON evaluation_template_cases(template_id);
