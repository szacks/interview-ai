-- Insert default parameters as rows into scoring_parameters table
-- These are the standard 4 parameters that come with every company

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    ss.id,
    'Communication',
    'Can explain code clearly, uses correct terminology',
    0.22,
    5,
    1,
    true
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Communication'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    ss.id,
    'Algorithmic Thinking',
    'Considers edge cases, discusses alternatives',
    0.28,
    5,
    2,
    true
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Algorithmic Thinking'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    ss.id,
    'Problem Solving',
    'Clean code, systematic debugging, error handling',
    0.28,
    5,
    3,
    true
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'Problem Solving'
);

INSERT INTO scoring_parameters (scoring_settings_id, name, description, weight, max_points, order_index, is_default)
SELECT
    ss.id,
    'AI Collaboration',
    'Uses AI effectively, reviews suggestions critically',
    0.22,
    5,
    4,
    true
FROM scoring_settings ss
WHERE NOT EXISTS (
    SELECT 1 FROM scoring_parameters sp WHERE sp.scoring_settings_id = ss.id AND sp.name = 'AI Collaboration'
);
