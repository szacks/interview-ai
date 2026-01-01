-- =====================================================================
-- Migration: Add Custom Question Builder Support (Simplified)
-- Version: V2__custom_question_builder_simplified.sql
-- Description: Extends questions table for company-created custom questions
--              Simplified version - removed: time_limit, input_output_examples,
--              tags, success_criteria, constraints, rubric fields
-- =====================================================================

-- =====================================================================
-- 1. ALTER questions TABLE - Add new columns for custom questions
-- =====================================================================

ALTER TABLE questions ADD COLUMN IF NOT EXISTS company_id BIGINT REFERENCES companies(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Note: description field already exists - will contain full problem with examples & constraints
-- Removed: time_limit_minutes (not needed)
-- Removed: input_output_examples (include in description)
-- Removed: constraints (include in description)
-- Removed: success_criteria (not needed)
-- Removed: tags (not needed for MVP)

-- AI Configuration fields (simplified)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_prompt_template VARCHAR(50); -- 'helpful', 'minimal', 'socratic', 'strict'
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_custom_prompt TEXT;          -- Custom prompt overrides template

-- Follow-up Questions (with expected answers)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS followup_questions JSONB;
-- Format: [{"id": "fq_1", "question": "...", "expectedAnswer": "..."}]

-- Code Generation Tracking
ALTER TABLE questions ADD COLUMN IF NOT EXISTS primary_language VARCHAR(20);    -- 'java', 'python', 'javascript'
ALTER TABLE questions ADD COLUMN IF NOT EXISTS generated_languages JSONB;       -- {"java": {"generated": true, "reviewed": true}}

-- Versioning & Status fields
ALTER TABLE questions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'DRAFT';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS parent_question_id BIGINT REFERENCES questions(id);

-- Metadata fields
ALTER TABLE questions ADD COLUMN IF NOT EXISTS usage_count INT DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS average_score DECIMAL(5,2);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- =====================================================================
-- 2. CREATE question_versions TABLE - Audit trail for question changes
-- =====================================================================

CREATE TABLE IF NOT EXISTS question_versions (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES questions(id) NOT NULL,
    version INT NOT NULL,
    changed_by BIGINT REFERENCES users(id) NOT NULL,
    changes_description TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_question_version UNIQUE (question_id, version)
);

COMMENT ON TABLE question_versions IS 'Audit trail of all question versions';
COMMENT ON COLUMN question_versions.snapshot IS 'Full JSON snapshot of question at this version';

-- =====================================================================
-- 3. CREATE INDEXES for performance
-- =====================================================================

-- Company and ownership indexes
CREATE INDEX IF NOT EXISTS idx_questions_company ON questions(company_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);

-- Status and filtering indexes
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);

-- Version management indexes
CREATE INDEX IF NOT EXISTS idx_questions_parent ON questions(parent_question_id);
CREATE INDEX IF NOT EXISTS idx_questions_version ON questions(version);

-- Timestamp indexes for sorting
CREATE INDEX IF NOT EXISTS idx_questions_published_at ON questions(published_at);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_updated_at ON questions(updated_at);

-- Question versions indexes
CREATE INDEX IF NOT EXISTS idx_question_versions_question ON question_versions(question_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_changed_by ON question_versions(changed_by);

-- =====================================================================
-- 4. MIGRATE EXISTING QUESTIONS - Set defaults for pre-built questions
-- =====================================================================

-- Set company_id = NULL for system/platform questions (available to all)
UPDATE questions 
SET 
    company_id = NULL,  -- System questions available to all companies
    created_by = 1,     -- System user
    status = 'PUBLISHED',
    version = 1,
    category = 'algorithm',
    short_description = LEFT(description, 200),
    ai_prompt_template = 'helpful',
    published_at = created_at
WHERE company_id IS NULL;

-- =====================================================================
-- 5. ADD CONSTRAINTS after data migration
-- =====================================================================

-- Unique constraint: company + title + version must be unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_question_version 
ON questions(company_id, title, version) 
WHERE company_id IS NOT NULL;

-- Check constraints
ALTER TABLE questions ADD CONSTRAINT chk_status 
CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'));

ALTER TABLE questions ADD CONSTRAINT chk_category 
CHECK (category IN (
    'algorithm', 
    'data_structures', 
    'system_design', 
    'api_design', 
    'database', 
    'frontend', 
    'backend', 
    'fullstack', 
    'debugging', 
    'refactoring', 
    'other'
));

ALTER TABLE questions ADD CONSTRAINT chk_ai_prompt_template 
CHECK (ai_prompt_template IS NULL OR ai_prompt_template IN ('helpful', 'minimal', 'socratic', 'strict'));

ALTER TABLE questions ADD CONSTRAINT chk_primary_language 
CHECK (primary_language IS NULL OR primary_language IN ('java', 'python', 'javascript'));

ALTER TABLE questions ADD CONSTRAINT chk_version_positive 
CHECK (version > 0);

ALTER TABLE questions ADD CONSTRAINT chk_usage_count_positive 
CHECK (usage_count >= 0);

ALTER TABLE questions ADD CONSTRAINT chk_average_score_range 
CHECK (average_score IS NULL OR (average_score >= 0 AND average_score <= 100));

-- =====================================================================
-- 6. CREATE TRIGGER - Auto-update updated_at timestamp
-- =====================================================================

CREATE OR REPLACE FUNCTION update_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_questions_updated_at ON questions;
CREATE TRIGGER trigger_update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_questions_updated_at();

-- =====================================================================
-- 7. INSERT SAMPLE DATA (optional - for testing)
-- =====================================================================

-- Sample custom question for testing
INSERT INTO questions (
    company_id,
    created_by,
    title,
    category,
    difficulty,
    short_description,
    description,
    initial_code_java,
    initial_code_python,
    initial_code_javascript,
    tests_json,
    ai_prompt_template,
    followup_questions,
    primary_language,
    generated_languages,
    status,
    version,
    published_at
) VALUES (
    1,  -- company_id
    2,  -- created_by (admin user id)
    'Build a Rate Limiter',
    'backend',
    'hard',
    'Build a thread-safe rate limiter that supports limiting requests per user within a time window',
    
    -- Full problem description (includes examples and constraints)
    '# Rate Limiter

Implement a rate limiter that allows a maximum number of requests per user within a given time window.

## Requirements
- Support configurable rate limits (e.g., 5 requests per minute)
- Thread-safe implementation
- Handle edge cases (empty user ID, negative timestamp, null values)

## Constraints
- Handle up to 1000 concurrent users
- Support 1-60 requests per minute range
- Memory efficient - cleanup old timestamps

## Examples

### Example 1: Basic Usage
```java
RateLimiter limiter = new RateLimiter(2, 1000); // 2 requests per 1000ms
limiter.allowRequest("user1", 0);     // true (first request)
limiter.allowRequest("user1", 100);   // true (second request)
limiter.allowRequest("user1", 200);   // false (rate limit exceeded)
limiter.allowRequest("user1", 1100);  // true (window reset)
```

### Example 2: Multiple Users
```java
limiter.allowRequest("user1", 0);     // true
limiter.allowRequest("user2", 0);     // true (different user)
```

### Example 3: Edge Cases
```java
limiter.allowRequest("", 0);          // should throw exception (empty user)
limiter.allowRequest(null, 0);        // should throw exception (null user)
limiter.allowRequest("user1", -1);    // should throw exception (negative timestamp)
```',
    
    -- Java template (primary language - written by user)
    'public class RateLimiter {
    public RateLimiter(int limit, long windowMs) {
        // TODO: Initialize
    }
    
    public boolean allowRequest(String userId, long timestamp) {
        // TODO: Implement
        return false;
    }
}',
    
    -- Python template (AI generated)
    'class RateLimiter:
    def __init__(self, limit: int, window_ms: int):
        # TODO: Initialize
        pass
    
    def allow_request(self, user_id: str, timestamp: int) -> bool:
        # TODO: Implement
        return False',
    
    -- JavaScript template (AI generated)
    'class RateLimiter {
    constructor(limit, windowMs) {
        // TODO: Initialize
    }
    
    allowRequest(userId, timestamp) {
        // TODO: Implement
        return false;
    }
}',
    
    -- Test cases (unified format with visibility toggle)
    '{
        "tests": [
            {
                "id": "test_1",
                "name": "Basic Usage",
                "description": "First request should be allowed",
                "setup": "const limiter = new RateLimiter(2, 1000);",
                "input": "limiter.allowRequest(''user1'', 0)",
                "expectedOutput": "true",
                "visibleToCandidate": true,
                "timeout": 5000
            },
            {
                "id": "test_2",
                "name": "Rate Limit Exceeded",
                "description": "Third request should be blocked",
                "setup": "const limiter = new RateLimiter(2, 1000); limiter.allowRequest(''user1'', 0); limiter.allowRequest(''user1'', 100);",
                "input": "limiter.allowRequest(''user1'', 200)",
                "expectedOutput": "false",
                "visibleToCandidate": false,
                "timeout": 5000
            },
            {
                "id": "test_3",
                "name": "Window Reset",
                "description": "Request after window should be allowed",
                "setup": "const limiter = new RateLimiter(2, 1000); limiter.allowRequest(''user1'', 0); limiter.allowRequest(''user1'', 100);",
                "input": "limiter.allowRequest(''user1'', 1100)",
                "expectedOutput": "true",
                "visibleToCandidate": false,
                "timeout": 5000
            }
        ]
    }'::jsonb,
    
    -- AI prompt template (using preset)
    'helpful',
    
    -- Follow-up questions with expected answers
    '[
        {
            "id": "fq_1",
            "question": "Walk me through your rate limiting algorithm. How does it work?",
            "expectedAnswer": "Strong candidates should:\n• Explain sliding window or token bucket approach\n• Mention timestamp tracking\n• Discuss cleanup strategy\n\nRed flags:\n• Cannot explain own code\n• Vague \"it just works\" responses"
        },
        {
            "id": "fq_2",
            "question": "What happens if two threads try to check the rate limit for the same user simultaneously?",
            "expectedAnswer": "Should mention:\n• Race conditions / concurrent access issues\n• ConcurrentHashMap or synchronization\n• Why regular HashMap is unsafe\n\nBonus points:\n• Discusses lock-free approaches\n• Mentions atomic operations"
        },
        {
            "id": "fq_3",
            "question": "How would you optimize this for millions of users?",
            "expectedAnswer": "Look for:\n• Memory cleanup strategy (TTL, LRU)\n• Distributed rate limiting (Redis)\n• Sharding/partitioning strategies\n\nNot expected but impressive:\n• Sliding window counters\n• Leaky bucket algorithm"
        }
    ]'::jsonb,
    
    -- Primary language (user wrote Java first)
    'java',
    
    -- Generated languages tracking
    '{"java": {"generated": false, "reviewed": true}, "python": {"generated": true, "reviewed": true}, "javascript": {"generated": true, "reviewed": true}}'::jsonb,
    
    -- Status
    'PUBLISHED',
    
    -- Version
    1,
    
    -- Published at
    CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;

-- =====================================================================
-- 8. CREATE HELPER FUNCTIONS (optional)
-- =====================================================================

-- Function to create new question version
CREATE OR REPLACE FUNCTION create_question_version(
    p_question_id BIGINT,
    p_changed_by BIGINT,
    p_changes_description TEXT
) RETURNS BIGINT AS $$
DECLARE
    v_new_version_id BIGINT;
    v_current_version INT;
    v_new_version INT;
    v_snapshot JSONB;
BEGIN
    -- Get current version
    SELECT version INTO v_current_version
    FROM questions
    WHERE id = p_question_id;
    
    v_new_version := v_current_version + 1;
    
    -- Get full question snapshot
    SELECT row_to_json(questions.*)::jsonb INTO v_snapshot
    FROM questions
    WHERE id = p_question_id;
    
    -- Insert version record
    INSERT INTO question_versions (
        question_id,
        version,
        changed_by,
        changes_description,
        snapshot
    ) VALUES (
        p_question_id,
        v_new_version,
        p_changed_by,
        p_changes_description,
        v_snapshot
    ) RETURNING id INTO v_new_version_id;
    
    RETURN v_new_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to archive question
CREATE OR REPLACE FUNCTION archive_question(p_question_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE questions
    SET 
        status = 'ARCHIVED',
        archived_at = CURRENT_TIMESTAMP
    WHERE id = p_question_id;
END;
$$ LANGUAGE plpgsql;

-- Function to duplicate question
CREATE OR REPLACE FUNCTION duplicate_question(
    p_question_id BIGINT,
    p_new_title TEXT,
    p_created_by BIGINT
) RETURNS BIGINT AS $$
DECLARE
    v_new_id BIGINT;
BEGIN
    INSERT INTO questions (
        company_id,
        created_by,
        title,
        category,
        difficulty,
        short_description,
        description,
        initial_code_java,
        initial_code_python,
        initial_code_javascript,
        tests_json,
        ai_prompt_template,
        ai_custom_prompt,
        followup_questions,
        primary_language,
        generated_languages,
        status,
        version
    )
    SELECT
        company_id,
        p_created_by,
        p_new_title,
        category,
        difficulty,
        short_description,
        description,
        initial_code_java,
        initial_code_python,
        initial_code_javascript,
        tests_json,
        ai_prompt_template,
        ai_custom_prompt,
        followup_questions,
        primary_language,
        generated_languages,
        'DRAFT',  -- New copy starts as draft
        1         -- New copy starts at version 1
    FROM questions
    WHERE id = p_question_id
    RETURNING id INTO v_new_id;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 9. CREATE VIEWS for common queries (optional)
-- =====================================================================

-- View: Published questions by company
CREATE OR REPLACE VIEW v_published_questions AS
SELECT 
    q.id,
    q.company_id,
    q.title,
    q.category,
    q.difficulty,
    q.short_description,
    q.status,
    q.version,
    q.usage_count,
    q.average_score,
    q.created_at,
    q.published_at,
    u.name as created_by_name,
    c.name as company_name
FROM questions q
LEFT JOIN users u ON q.created_by = u.id
LEFT JOIN companies c ON q.company_id = c.id
WHERE q.status = 'PUBLISHED';

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================

-- Verify migration
SELECT 
    'Migration completed successfully' as status,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published,
    COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as drafts,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as company_questions,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as system_questions
FROM questions;
