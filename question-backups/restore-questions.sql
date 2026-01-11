-- =====================================================================
-- SQL Script to Restore Questions from Backup
-- =====================================================================
-- Usage: psql -U postgres -d interviewai_db -f restore-questions.sql
-- Or run from your SQL client (DBeaver, pgAdmin, etc.)
-- =====================================================================

-- Note: This script uses INSERT ON CONFLICT DO NOTHING to avoid duplicates
-- If a question with the same title already exists, it will be skipped

-- =====================================================================
-- Question 1: Rate Limiter
-- =====================================================================

INSERT INTO questions (
    company_id,
    created_by,
    title,
    description,
    short_description,
    category,
    difficulty,
    time_limit_minutes,
    primary_language,
    supported_languages,
    initial_code_java,
    initial_code_python,
    initial_code_javascript,
    tests_json,
    ai_prompt_template,
    ai_helper_name,
    generated_languages_json,
    status,
    version,
    current_step,
    usage_count,
    deactivated,
    created_at,
    updated_at,
    published_at
) VALUES (
    NULL,  -- company_id (NULL = platform question)
    1,     -- created_by (system user)
    'Build a Rate Limiter',
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
    'Build a thread-safe rate limiter that supports limiting requests per user within a time window',
    'backend',
    'hard',
    45,
    'java',
    'java,python,javascript',
    'public class RateLimiter {
    public RateLimiter(int limit, long windowMs) {
        // TODO: Initialize
    }

    public boolean allowRequest(String userId, long timestamp) {
        // TODO: Implement
        return false;
    }
}',
    'class RateLimiter:
    def __init__(self, limit: int, window_ms: int):
        # TODO: Initialize
        pass

    def allow_request(self, user_id: str, timestamp: int) -> bool:
        # TODO: Implement
        return False',
    'class RateLimiter {
    constructor(limit, windowMs) {
        // TODO: Initialize
    }

    allowRequest(userId, timestamp) {
        // TODO: Implement
        return false;
    }
}',
    '[
  {
    "id": "test_1",
    "name": "Basic Usage - First Request",
    "description": "First request should be allowed",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "RateLimiter limiter = new RateLimiter(2, 1000);",
    "input": "limiter.allowRequest(\"user1\", 0)",
    "expectedOutput": "true"
  },
  {
    "id": "test_2",
    "name": "Rate Limit Exceeded",
    "description": "Third request should be blocked",
    "visibleToCandidate": false,
    "timeout": 5000,
    "setup": "RateLimiter limiter = new RateLimiter(2, 1000); limiter.allowRequest(\"user1\", 0); limiter.allowRequest(\"user1\", 100);",
    "input": "limiter.allowRequest(\"user1\", 200)",
    "expectedOutput": "false"
  },
  {
    "id": "test_3",
    "name": "Window Reset",
    "description": "Request after window should be allowed",
    "visibleToCandidate": false,
    "timeout": 5000,
    "setup": "RateLimiter limiter = new RateLimiter(2, 1000); limiter.allowRequest(\"user1\", 0); limiter.allowRequest(\"user1\", 100);",
    "input": "limiter.allowRequest(\"user1\", 1100)",
    "expectedOutput": "true"
  },
  {
    "id": "test_4",
    "name": "Multiple Users",
    "description": "Different users should have separate rate limits",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "RateLimiter limiter = new RateLimiter(1, 1000); limiter.allowRequest(\"user1\", 0);",
    "input": "limiter.allowRequest(\"user2\", 0)",
    "expectedOutput": "true"
  }
]'::text,
    'helpful',
    'Backend Expert',
    '{"java": {"generated": false, "reviewed": true}, "python": {"generated": true, "reviewed": true}, "javascript": {"generated": true, "reviewed": true}}'::text,
    'PUBLISHED',
    1,
    7,
    0,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (company_id, title, version) DO NOTHING;

-- Get the question ID for adding follow-up questions and test cases
DO $$
DECLARE
    v_question_id BIGINT;
BEGIN
    SELECT id INTO v_question_id FROM questions WHERE title = 'Build a Rate Limiter' LIMIT 1;

    IF v_question_id IS NOT NULL THEN
        -- Add follow-up questions
        INSERT INTO follow_up_questions (question_id, question_text, answer, order_index, created_at) VALUES
        (v_question_id, 'Walk me through your rate limiting algorithm. How does it work?',
         'Strong candidates should:
• Explain sliding window or token bucket approach
• Mention timestamp tracking
• Discuss cleanup strategy

Red flags:
• Cannot explain own code
• Vague "it just works" responses', 0, CURRENT_TIMESTAMP),

        (v_question_id, 'What happens if two threads try to check the rate limit for the same user simultaneously?',
         'Should mention:
• Race conditions / concurrent access issues
• ConcurrentHashMap or synchronization
• Why regular HashMap is unsafe

Bonus points:
• Discusses lock-free approaches
• Mentions atomic operations', 1, CURRENT_TIMESTAMP),

        (v_question_id, 'How would you optimize this for millions of users?',
         'Look for:
• Memory cleanup strategy (TTL, LRU)
• Distributed rate limiting (Redis)
• Sharding/partitioning strategies

Not expected but impressive:
• Sliding window counters
• Leaky bucket algorithm', 2, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;

        -- Add test cases
        INSERT INTO test_cases (question_id, test_name, test_case, description, operations_json, assertions_json, order_index, passed, created_at) VALUES
        (v_question_id, 'Basic - First Request Allowed', 'limiter.allowRequest("user1", 0)',
         'The first request for any user should always be allowed',
         '[{"method": "allowRequest", "args": ["user1", 0]}]',
         '[{"type": "assertEquals", "expected": true, "message": "First request should be allowed"}]',
         0, false, CURRENT_TIMESTAMP),

        (v_question_id, 'Rate Limit - Third Request Blocked', 'limiter.allowRequest("user1", 200)',
         'When rate limit is 2, the third request within window should be blocked',
         '[{"method": "allowRequest", "args": ["user1", 0]}, {"method": "allowRequest", "args": ["user1", 100]}, {"method": "allowRequest", "args": ["user1", 200]}]',
         '[{"type": "assertEquals", "expected": false, "message": "Third request should be blocked"}]',
         1, false, CURRENT_TIMESTAMP),

        (v_question_id, 'Window Reset - Request After Window Allowed', 'limiter.allowRequest("user1", 1100)',
         'After the time window expires, requests should be allowed again',
         '[{"method": "allowRequest", "args": ["user1", 0]}, {"method": "allowRequest", "args": ["user1", 100]}, {"method": "allowRequest", "args": ["user1", 1100]}]',
         '[{"type": "assertEquals", "expected": true, "message": "Request after window should be allowed"}]',
         2, false, CURRENT_TIMESTAMP),

        (v_question_id, 'Multiple Users - Separate Limits', 'limiter.allowRequest("user2", 0)',
         'Different users should have independent rate limits',
         '[{"method": "allowRequest", "args": ["user1", 0]}, {"method": "allowRequest", "args": ["user2", 0]}]',
         '[{"type": "assertEquals", "expected": true, "message": "Different user should be allowed"}]',
         3, false, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- Question 2: Two Sum
-- =====================================================================

INSERT INTO questions (
    company_id,
    created_by,
    title,
    description,
    short_description,
    category,
    difficulty,
    time_limit_minutes,
    primary_language,
    supported_languages,
    initial_code_java,
    initial_code_python,
    initial_code_javascript,
    tests_json,
    ai_prompt_template,
    ai_helper_name,
    generated_languages_json,
    status,
    version,
    current_step,
    usage_count,
    deactivated,
    created_at,
    updated_at,
    published_at
) VALUES (
    NULL,
    1,
    'Two Sum',
    '# Two Sum

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

## Requirements
- You may assume that each input would have exactly one solution
- You may not use the same element twice
- Return the answer in any order

## Constraints
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists

## Examples

### Example 1:
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

### Example 2:
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

### Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## Follow-up
Can you come up with an algorithm that is less than O(n^2) time complexity?',
    'Find two numbers in an array that add up to a target value and return their indices',
    'algorithm',
    'easy',
    20,
    'java',
    'java,python,javascript',
    'public class Solution {
    public int[] twoSum(int[] nums, int target) {
        // TODO: Implement
        return new int[0];
    }
}',
    'class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # TODO: Implement
        pass',
    '/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // TODO: Implement
};',
    '[
  {
    "id": "test_1",
    "name": "Example 1",
    "description": "Basic test with target 9",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "Solution solution = new Solution();",
    "input": "solution.twoSum(new int[]{2,7,11,15}, 9)",
    "expectedOutput": "[0,1]"
  }
]'::text,
    'helpful',
    'Algorithm Mentor',
    '{"java": {"generated": false, "reviewed": true}, "python": {"generated": true, "reviewed": true}, "javascript": {"generated": true, "reviewed": true}}'::text,
    'PUBLISHED',
    1,
    7,
    0,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (company_id, title, version) DO NOTHING;

-- =====================================================================
-- Restore Complete
-- =====================================================================

SELECT
    'Restore completed successfully' as status,
    COUNT(*) as total_questions,
    COUNT(CASE WHEN status = 'PUBLISHED' THEN 1 END) as published_questions
FROM questions;
