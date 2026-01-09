-- Create scoring settings for any company that doesn't have one yet
INSERT INTO scoring_settings (company_id, auto_score_weight, manual_score_weight, created_at, updated_at)
SELECT c.id, 0.4, 0.6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_settings ss WHERE ss.company_id = c.id
);

-- Now insert the 4 default parameters for each company's scoring_settings
INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default, created_at)
SELECT
    ss.id,
    'Communication',
    'Can explain code clearly, uses correct terminology',
    0.22,
    5,
    1,
    true,
    CURRENT_TIMESTAMP
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Communication'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default, created_at)
SELECT
    ss.id,
    'Algorithmic Thinking',
    'Considers edge cases, discusses alternatives',
    0.28,
    5,
    2,
    true,
    CURRENT_TIMESTAMP
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Algorithmic Thinking'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default, created_at)
SELECT
    ss.id,
    'Problem Solving',
    'Clean code, systematic debugging, error handling',
    0.28,
    5,
    3,
    true,
    CURRENT_TIMESTAMP
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Problem Solving'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default, created_at)
SELECT
    ss.id,
    'AI Collaboration',
    'Uses AI effectively, reviews suggestions critically',
    0.22,
    5,
    4,
    true,
    CURRENT_TIMESTAMP
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'AI Collaboration'
);
