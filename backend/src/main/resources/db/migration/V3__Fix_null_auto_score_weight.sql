-- Fix null values in auto_score_weight column by setting them to the default value
UPDATE user_settings SET auto_score_weight = 50 WHERE auto_score_weight IS NULL;

-- Also ensure show_run_tests has a proper default if null
UPDATE user_settings SET show_run_tests = true WHERE show_run_tests IS NULL;
