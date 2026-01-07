-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    default_agent_id BIGINT,
    show_run_tests BOOLEAN NOT NULL DEFAULT true,
    auto_score_weight INTEGER NOT NULL DEFAULT 50 CHECK (auto_score_weight >= 0 AND auto_score_weight <= 100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_settings_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_settings_agent_id FOREIGN KEY (default_agent_id) REFERENCES agent_templates(id) ON DELETE SET NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
