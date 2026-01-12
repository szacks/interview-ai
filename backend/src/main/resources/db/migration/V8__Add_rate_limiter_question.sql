-- Add Rate Limiter question with company_id = 1
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
    ai_custom_prompt,
    ai_helper_name,
    agent_template_id,
    followup_questions_json,
    generated_languages_json,
    status,
    version,
    deactivated,
    created_at,
    updated_at
) VALUES (
    1,
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
    '{"tests":[{"testCase":"TC1","name":"allows requests under limit","operations":[],"assertions":[],"description":"3 requests with limit 3 should all be true","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC2","name":"blocks request when limit reached","operations":[],"assertions":[],"description":"3rd request with limit 2 should be false","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC3","name":"allows request after window expires","operations":[],"assertions":[],"description":"After window expires, new requests should be allowed","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC4","name":"each limiter is independent","operations":[],"assertions":[],"description":"Two limiters should track separately","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC5","name":"handles limit of 1","operations":[],"assertions":[],"description":"Single request limit should work correctly","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC6","name":"sliding window - partial expiry","operations":[],"assertions":[],"description":"Sliding window should handle partial expiry correctly","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"},{"testCase":"TC7","name":"high volume - 10 requests with limit 10","operations":[],"assertions":[],"description":"Should handle high volume requests","input":"const limiter = new RateLimiter(2, 1000);\nassert(limiter.allowRequest(\"user1\", 0) === true);\nassert(limiter.allowRequest(\"user1\", 100) === true);\nassert(limiter.allowRequest(\"user1\", 200) === false);"}]}',
    '{"requirements":["Create a rate limiter with max requests and time window","Implement allowRequest function","Track request timestamps efficiently","Handle time window expiration","Support multiple independent limiters"]}',
    '{"categories":[{"category":"Correctness","points":25,"description":"Basic solution passes tests"},{"category":"Edge Cases","points":15,"description":"Handles edge cases (limit=1, empty, boundary)"},{"category":"Memory Efficiency","points":20,"description":"Recognizes memory problem with high traffic"},{"category":"Alternative Solutions","points":20,"description":"Discusses or implements memory-efficient alternative"},{"category":"AI Collaboration","points":20,"description":"Uses AI effectively - asks good questions, reviews critically"}]}',
    '{"bugs":[{"name":"Memory grows unbounded","description":"Stores all timestamps causing memory issues with high traffic","difficulty":"common"},{"name":"Doesn''t filter expired requests","description":"Counts expired requests towards the limit","difficulty":"medium"},{"name":"Off-by-one error","description":"Allows one too many or too few requests","difficulty":"common"},{"name":"No window reset","description":"Never allows new requests after window fills up","difficulty":"hard"}]}',
    'helpful',
    NULL,
    NULL,
    NULL,
    '[]',
    '{"java":{"generated":false,"reviewed":true},"python":{"generated":false,"reviewed":true},"javascript":{"generated":false,"reviewed":true}}',
    'PUBLISHED',
    6,
    false,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
