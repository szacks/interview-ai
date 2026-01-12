-- Set company_id = 1 for Rate Limiter and Log questions
UPDATE questions
SET company_id = 1
WHERE title IN ('Rate Limiter', 'Log')
  AND company_id IS NULL;
