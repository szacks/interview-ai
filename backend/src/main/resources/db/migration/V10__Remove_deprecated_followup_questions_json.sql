-- Remove deprecated followup_questions_json column
-- Follow-up questions are now stored exclusively in the follow_up_questions table
-- via the One-to-Many relationship in the Question entity

ALTER TABLE questions
DROP COLUMN IF EXISTS followup_questions_json;

-- Add comment to track the change
COMMENT ON TABLE follow_up_questions IS 'Stores follow-up questions for interviews. This is the single source of truth for follow-up questions (previously duplicated in questions.followup_questions_json).';
