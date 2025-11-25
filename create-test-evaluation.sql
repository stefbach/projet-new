-- Create a test evaluation template

-- Insert template
INSERT INTO evaluation_templates (id, name, description, duration_minutes, passing_score, is_active, created_at)
VALUES (
  'eval-test-001',
  'Évaluation Médicale Générale - Test',
  'Évaluation de démonstration avec 10 QCM et 3 cas cliniques',
  60,
  70.0,
  1,
  datetime('now')
);

-- Add first 10 QCM to the template
INSERT INTO evaluation_template_qcm (template_id, qcm_id, order_index, weight)
SELECT 
  'eval-test-001',
  id,
  ROW_NUMBER() OVER (ORDER BY created_at) - 1,
  1.0
FROM generated_qcm
LIMIT 10;

-- Add first 3 clinical cases to the template
INSERT INTO evaluation_template_cases (template_id, case_id, order_index, weight)
SELECT 
  'eval-test-001',
  id,
  ROW_NUMBER() OVER (ORDER BY created_at) - 1,
  2.0
FROM clinical_cases
LIMIT 3;

SELECT 'Test evaluation created successfully' as message;
