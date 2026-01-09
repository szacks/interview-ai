-- Create company_settings table for company-level (admin) settings
CREATE TABLE company_settings (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL UNIQUE,

    -- Score Distribution (company level)
    auto_score_weight INTEGER NOT NULL DEFAULT 40,
    manual_score_weight INTEGER NOT NULL DEFAULT 60,

    -- Data Retention (admin level)
    data_retention_days INTEGER NOT NULL DEFAULT 90,

    -- Session Settings (admin level)
    default_session_timeout_minutes INTEGER NOT NULL DEFAULT 120,

    -- Scoring Thresholds (company level)
    score_exceptional_threshold INTEGER NOT NULL DEFAULT 91,
    score_strong_threshold INTEGER NOT NULL DEFAULT 81,
    score_good_threshold INTEGER NOT NULL DEFAULT 71,
    score_concerning_threshold INTEGER NOT NULL DEFAULT 51,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT check_auto_weight_range CHECK (auto_score_weight >= 0 AND auto_score_weight <= 100),
    CONSTRAINT check_manual_weight_range CHECK (manual_score_weight >= 0 AND manual_score_weight <= 100),
    CONSTRAINT check_weights_sum CHECK (auto_score_weight + manual_score_weight = 100),
    CONSTRAINT check_data_retention_positive CHECK (data_retention_days > 0 OR data_retention_days = -1),
    CONSTRAINT check_session_timeout_positive CHECK (default_session_timeout_minutes > 0 OR default_session_timeout_minutes = -1)
);

-- Create assessment_parameters table for configurable scoring parameters (company level)
CREATE TABLE assessment_parameters (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_score INTEGER NOT NULL DEFAULT 5,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT check_max_score_positive CHECK (max_score > 0),
    CONSTRAINT check_weight_positive CHECK (weight > 0),
    UNIQUE (company_id, name)
);

-- Create index for faster lookups
CREATE INDEX idx_assessment_parameters_company_id ON assessment_parameters(company_id);
CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);

-- Insert default assessment parameters for existing companies
INSERT INTO assessment_parameters (company_id, name, description, max_score, weight, display_order)
SELECT
    c.id,
    param.name,
    param.description,
    param.max_score,
    param.weight,
    param.display_order
FROM companies c
CROSS JOIN (
    VALUES
        ('Communication', 'Clarity of explanations and ability to articulate thought process', 5, 1.00, 1),
        ('Algorithmic Thinking', 'Understanding of data structures, algorithms, and complexity', 5, 1.00, 2),
        ('Problem Solving', 'Approach to breaking down problems and finding solutions', 5, 1.00, 3),
        ('AI Collaboration', 'Effective use of AI tools and ability to iterate on suggestions', 5, 1.00, 4)
) AS param(name, description, max_score, weight, display_order);

-- Insert default company settings for existing companies
INSERT INTO company_settings (company_id)
SELECT id FROM companies;

-- Remove data_retention_days from user_settings (moved to company level)
-- Note: We keep the column for backwards compatibility but it will be ignored
-- ALTER TABLE user_settings DROP COLUMN data_retention_days;
