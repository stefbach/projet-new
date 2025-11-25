-- Table pour stocker la configuration API (clé OpenAI)
CREATE TABLE IF NOT EXISTS api_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key TEXT UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insérer une entrée par défaut pour la clé OpenAI (vide)
INSERT OR IGNORE INTO api_config (config_key, config_value) 
VALUES ('openai_api_key', '');

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_api_config_key ON api_config(config_key);
