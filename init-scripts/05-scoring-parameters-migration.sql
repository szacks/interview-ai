-- Create scoring_parameters table for dynamic assessment parameters
CREATE TABLE IF NOT EXISTS scoring_parameters (
    id BIGSERIAL PRIMARY KEY,
    scoring_settings_id BIGINT NOT NULL REFERENCES scoring_settings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,4) NOT NULL CHECK (weight >= 0.0 AND weight <= 1.0),
    max_points INTEGER DEFAULT 5,
    order_index INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scoring_parameters_settings
    ON scoring_parameters(scoring_settings_id);

CREATE INDEX IF NOT EXISTS idx_scoring_parameters_order
    ON scoring_parameters(scoring_settings_id, order_index);

-- Migrate existing hardcoded parameters to new table
INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    id,
    'Communication',
    'Can explain code clearly, uses correct terminology',
    communication_weight,
    5,
    1,
    true
FROM scoring_settings
WHERE communication_weight IS NOT NULL;

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    id,
    'Algorithmic Thinking',
    'Considers edge cases, discusses alternatives',
    algorithmic_weight,
    5,
    2,
    true
FROM scoring_settings
WHERE algorithmic_weight IS NOT NULL;

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    id,
    'Problem Solving',
    'Clean code, systematic debugging, error handling',
    problem_solving_weight,
    5,
    3,
    true
FROM scoring_settings
WHERE problem_solving_weight IS NOT NULL;

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    id,
    'AI Collaboration',
    'Uses AI effectively, reviews suggestions critically',
    ai_collaboration_weight,
    5,
    4,
    true
FROM scoring_settings
WHERE ai_collaboration_weight IS NOT NULL;

-- Drop old columns after migration verification
ALTER TABLE scoring_settings DROP COLUMN IF EXISTS communication_weight;
ALTER TABLE scoring_settings DROP COLUMN IF EXISTS algorithmic_weight;
ALTER TABLE scoring_settings DROP COLUMN IF EXISTS problem_solving_weight;
ALTER TABLE scoring_settings DROP COLUMN IF EXISTS ai_collaboration_weight;
ALTER TABLE scoring_settings DROP COLUMN IF EXISTS additional_parameters;
