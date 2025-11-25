-- Add evaluation tracking columns to doctors table
-- Migration 0005: Add doctor scores and evaluation status

ALTER TABLE doctors ADD COLUMN tmcq_total INTEGER DEFAULT 0;
ALTER TABLE doctors ADD COLUMN evaluation_status TEXT CHECK (evaluation_status IN ('apte', 'supervision_requise', 'formation_requise', 'non_evalue')) DEFAULT 'non_evalue';
ALTER TABLE doctors ADD COLUMN last_evaluation_date TEXT;
