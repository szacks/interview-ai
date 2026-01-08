-- Add security settings columns to user_settings table
ALTER TABLE user_settings
ADD COLUMN session_timeout_minutes INTEGER NOT NULL DEFAULT 120,
ADD COLUMN data_retention_days INTEGER NOT NULL DEFAULT 90;

-- Add constraints
ALTER TABLE user_settings
ADD CONSTRAINT check_session_timeout_positive CHECK (session_timeout_minutes > 0 OR session_timeout_minutes = -1),
ADD CONSTRAINT check_data_retention_positive CHECK (data_retention_days > 0 OR data_retention_days = -1);

-- Note: -1 means "never" for session timeout and "forever" for data retention
