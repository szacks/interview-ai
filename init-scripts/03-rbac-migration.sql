-- RBAC Migration Script
-- Adds role validation and performance indexes

-- Add check constraint for valid roles (if not already present)
ALTER TABLE users
ADD CONSTRAINT check_valid_role
CHECK (role IN ('admin', 'interviewer', 'candidate'));

-- Add index on role column for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add index on company_id and role for compound queries
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users(company_id, role);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);
