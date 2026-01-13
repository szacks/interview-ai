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
-- Question 3: Rate Limiter (Updated Version)
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
    requirements_json,
    rubric_json,
    intentional_bugs_json,
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
    'Rate Limiter',
    'Build a rate limiter that controls how many requests are allowed in a time window.

EXAMPLE:
const limiter = new RateLimiter(3, 1000); // 3 requests per second
limiter.allowRequest(); // true
limiter.allowRequest(); // true
limiter.allowRequest(); // true
limiter.allowRequest(); // false (limit reached)
// After 1 second passes, requests are allowed again',
    'Build a rate limiter that controls how many requests are allowed in a time window.',
    'algorithm',
    'medium',
    35,
    'javascript',
    'java,python,javascript',
    '// Rate Limiter
import java.util.*;

public class RateLimiter {

    public RateLimiter(int maxRequests, long windowMs) {
        // TODO: Initialize the rate limiter
    }

    public boolean allowRequest() {
        // TODO: Return true if request allowed, false if limit exceeded
        return false;
    }
}',
    '# Rate Limiter
import time

class RateLimiter:
    def __init__(self, max_requests, window_ms):
        # TODO: Initialize the rate limiter
        pass

    def allow_request(self):
        # TODO: Return True if request allowed, False if limit exceeded
        return False',
    '// Rate Limiter

class RateLimiter {
  constructor(maxRequests, windowMs) {
    // TODO: Initialize the rate limiter
  }

  allowRequest() {
    // TODO: Return true if request allowed, false if limit exceeded
    return false;
  }
}',
    '{"tests":[{"testCase":"TC1","name":"allows requests under limit","operations":[],"assertions":[],"description":"3 requests with limit 3 should all be true","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC2","name":"blocks request when limit reached","operations":[],"assertions":[],"description":"3rd request with limit 2 should be false","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC3","name":"allows request after window expires","operations":[],"assertions":[],"description":"After window expires, new requests should be allowed","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC4","name":"each limiter is independent","operations":[],"assertions":[],"description":"Two limiters should track separately","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC5","name":"handles limit of 1","operations":[],"assertions":[],"description":"Single request limit should work correctly","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC6","name":"sliding window - partial expiry","operations":[],"assertions":[],"description":"Sliding window should handle partial expiry correctly","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC7","name":"high volume - 10 requests with limit 10","operations":[],"assertions":[],"description":"Should handle high volume requests","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"}]}'::text,
    '{"requirements":["Create a rate limiter with max requests and time window","Implement allowRequest function","Track request timestamps efficiently","Handle time window expiration","Support multiple independent limiters"]}'::text,
    '{"categories":[{"category":"Correctness","points":25,"description":"Basic solution passes tests"},{"category":"Edge Cases","points":15,"description":"Handles edge cases (limit=1, empty, boundary)"},{"category":"Memory Efficiency","points":20,"description":"Recognizes memory problem with high traffic"},{"category":"Alternative Solutions","points":20,"description":"Discusses or implements memory-efficient alternative"},{"category":"AI Collaboration","points":20,"description":"Uses AI effectively - asks good questions, reviews critically"}]}'::text,
    '{"bugs":[{"name":"Memory grows unbounded","description":"Stores all timestamps causing memory issues with high traffic","difficulty":"common"},{"name":"Doesn''t filter expired requests","description":"Counts expired requests towards the limit","difficulty":"medium"},{"name":"Off-by-one error","description":"Allows one too many or too few requests","difficulty":"common"},{"name":"No window reset","description":"Never allows new requests after window fills up","difficulty":"hard"}]}'::text,
    'helpful',
    NULL,
    '{"java":{"generated":false,"reviewed":true},"python":{"generated":false,"reviewed":true},"javascript":{"generated":false,"reviewed":true}}'::text,
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
-- Question 4: Log Aggregator System
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
    requirements_json,
    rubric_json,
    intentional_bugs_json,
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
    'Log Aggregator System',
    'Build a log aggregator that can write, read, and count log entries.

Levels: "DEBUG", "INFO", "WARN", "ERROR"

Example:

  Logger logger = new Logger();

  // Write logs (timestamp is auto-generated)
  logger.write("INFO", "Server started");      // t=1000
  logger.write("ERROR", "Connection failed");  // t=1001
  logger.write("INFO", "Operation started");   // t=1002

  // Read with filter (newest first)
  LogFilter filter = new LogFilter();
  filter.level = "INFO";
  List<LogEntry> logs = logger.read(filter);
  // Returns: [
  //   {timestamp: 1002, level: "INFO", message: "Operation started"},
  //   {timestamp: 1000, level: "INFO", message: "Server started"}
  // ]

  // Count in time range
  int count = logger.count("ERROR", 1000, 1002);  // Returns: 1',
    'Build a log aggregator that can write, read, and count log entries.',
    'data_structures',
    'medium',
    45,
    'java',
    'java,python,javascript',
    'class Logger {
  public Logger() {
    // TODO: implement
  }
  public void write(String level, String message) {
    // TODO: implement
  }
  public List<LogEntry> read(LogFilter filter) {
    // TODO: Implement
    return null;
  }
  public int count(String level, long startTime, long endTime) {
    // TODO: Implement
    return 0;
  }
}
class LogEntry {
  public long timestamp;
  public String level;
  public String message;
}
class LogFilter {
  public String level;
  public Long startTime;
  public Long endTime;
}',
    'from typing import List
class Logger:
    def __init__(self):
        # TODO: implement
        pass
    def write(self, level: str, message: str) -> None:
        # TODO: implement
        pass
    def read(self, filter: ''LogFilter'') -> List[''LogEntry'']:
        # TODO: Implement
        return None
    def count(self, level: str, start_time: int, end_time: int) -> int:
        # TODO: Implement
        return 0
class LogEntry:
    def __init__(self):
        self.timestamp: int = None
        self.level: str = None
        self.message: str = None
class LogFilter:
    def __init__(self):
        self.level: str = None
        self.start_time: int = None
        self.end_time: int = None',
    'class Logger {
  constructor() {
    // TODO: implement
  }
  write(level, message) {
    // TODO: implement
  }
  read(filter) {
    // TODO: Implement
    return null;
  }
  count(level, startTime, endTime) {
    // TODO: Implement
    return 0;
  }
}
class LogEntry {
  constructor() {
    this.timestamp = null;
    this.level = null;
    this.message = null;
  }
}
class LogFilter {
  constructor() {
    this.level = null;
    this.startTime = null;
    this.endTime = null;
  }
}',
    '{"tests":[{"id":"test_1","name":"Read returns newest first","description":"","input":"Test reading logs in reverse order","expectedOutput":""},{"id":"test_2","name":"Filter by level","description":"","input":"Test filtering by log level","expectedOutput":""},{"id":"test_3","name":"Filter by time range","description":"","input":"Test filtering by time range","expectedOutput":""},{"id":"test_4","name":"Count by level","description":"","input":"Test counting logs by level","expectedOutput":""},{"id":"test_5","name":"Count with time range","description":"","input":"Test counting with time range","expectedOutput":""},{"id":"test_6","name":"Combined filter","description":"","input":"Test combined filtering","expectedOutput":""}]}'::text,
    '{"requirements":["Implement LogSystem class with constructor","Store logs with timestamp and message","Retrieve logs within time range [start, end] inclusive","Handle edge cases (empty range, single timestamp)","Maintain chronological order","Optimize for time and space efficiency"]}'::text,
    '{"categories":[{"category":"Correctness","points":25,"description":"Basic solution passes all test cases"},{"category":"Data Structure Choice","points":20,"description":"Chooses appropriate data structure (array, map, etc.)"},{"category":"Efficiency","points":20,"description":"Efficient retrieval algorithm (binary search for large datasets)"},{"category":"Edge Cases","points":15,"description":"Handles empty ranges, same timestamps, boundaries"},{"category":"Code Quality","points":10,"description":"Clean, readable code with good naming"},{"category":"AI Collaboration","points":10,"description":"Uses AI effectively for optimization ideas"}]}'::text,
    '{"bugs":[{"name":"Off-by-one in range check","description":"Uses < instead of <= causing boundary logs to be missed","difficulty":"common"},{"name":"Inefficient linear search","description":"Doesn''t use binary search for large log sets","difficulty":"medium"},{"name":"Doesn''t handle same timestamps","description":"Only stores one log per timestamp","difficulty":"medium"},{"name":"Return format incorrect","description":"Returns wrong format (missing timestamp prefix or colon)","difficulty":"common"}]}'::text,
    'helpful',
    'System Design Mentor',
    '{"java":{"generated":false,"reviewed":true},"python":{"generated":true,"reviewed":true},"javascript":{"generated":true,"reviewed":true}}'::text,
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
