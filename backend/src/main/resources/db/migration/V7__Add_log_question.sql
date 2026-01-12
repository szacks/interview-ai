-- Add Log question with company_id = 1
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
    'Design a Log System',
    '# Design a Log System

Design a logging system that stores log messages with timestamps and supports querying logs by time range.

## Requirements

1. **Store logs** - Each log has:
   - `id` (unique number)
   - `timestamp` (Unix timestamp in seconds)
   - `message` (string)

2. **Store log** - Add a new log entry
   ```javascript
   void storeLog(int timestamp, string message)
   ```

3. **Retrieve logs** - Get all logs within a time range [start, end] inclusive
   ```javascript
   string[] retrieveLogs(int start, int end)
   ```

## Constraints

- All timestamps are in ascending order (each new log has a timestamp >= previous)
- 1 <= timestamp <= 10^9
- 1 <= message.length <= 100
- At most 10^5 calls total to `storeLog` and `retrieveLogs`
- start <= end for all retrieve calls

## Examples

### Example 1: Basic Usage
```javascript
const logger = new LogSystem();
logger.storeLog(1, "System started");
logger.storeLog(2, "User logged in");
logger.storeLog(3, "Error occurred");
logger.storeLog(6, "System shutdown");

logger.retrieveLogs(1, 3);
// Returns: ["1: System started", "2: User logged in", "3: Error occurred"]

logger.retrieveLogs(2, 5);
// Returns: ["2: User logged in", "3: Error occurred"]

logger.retrieveLogs(10, 20);
// Returns: [] (no logs in this range)
```

### Example 2: Edge Cases
```javascript
const logger = new LogSystem();
logger.storeLog(1, "First log");
logger.retrieveLogs(1, 1);
// Returns: ["1: First log"] (single timestamp range)

logger.retrieveLogs(0, 0);
// Returns: [] (no logs before first entry)
```

### Example 3: Large Time Range
```javascript
const logger = new LogSystem();
logger.storeLog(1, "Log A");
logger.storeLog(1000000, "Log B");
logger.retrieveLogs(1, 1000000);
// Returns: ["1: Log A", "1000000: Log B"]
```

## Follow-up Considerations

- How would you optimize for frequent retrievals?
- What if logs don''t come in sorted order?
- How would you handle millions of logs?
- How would you add filtering by log level (INFO, ERROR, etc.)?',
    'Design a logging system that stores timestamped messages and supports time-range queries',
    'data_structures',
    'medium',
    25,
    'javascript',
    'java,python,javascript',
    '// Log System
import java.util.*;

public class LogSystem {

    public LogSystem() {
        // TODO: Initialize data structures
    }

    public void storeLog(int timestamp, String message) {
        // TODO: Store the log entry
    }

    public List<String> retrieveLogs(int start, int end) {
        // TODO: Return all logs in time range [start, end]
        return new ArrayList<>();
    }
}',
    '# Log System
from typing import List

class LogSystem:

    def __init__(self):
        # TODO: Initialize data structures
        pass

    def store_log(self, timestamp: int, message: str) -> None:
        # TODO: Store the log entry
        pass

    def retrieve_logs(self, start: int, end: int) -> List[str]:
        # TODO: Return all logs in time range [start, end]
        return []',
    '// Log System

class LogSystem {
  constructor() {
    // TODO: Initialize data structures
  }

  storeLog(timestamp, message) {
    // TODO: Store the log entry
  }

  retrieveLogs(start, end) {
    // TODO: Return all logs in time range [start, end]
    return [];
  }
}',
    '[
  {
    "id": "test_1",
    "name": "Basic Storage and Retrieval",
    "description": "Store multiple logs and retrieve them",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''System started''); logger.storeLog(2, ''User logged in''); logger.storeLog(3, ''Error occurred'');",
    "input": "logger.retrieveLogs(1, 3)",
    "expectedOutput": "[''1: System started'', ''2: User logged in'', ''3: Error occurred'']"
  },
  {
    "id": "test_2",
    "name": "Partial Range Retrieval",
    "description": "Retrieve logs in a partial time range",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''A''); logger.storeLog(2, ''B''); logger.storeLog(3, ''C''); logger.storeLog(6, ''D'');",
    "input": "logger.retrieveLogs(2, 5)",
    "expectedOutput": "[''2: B'', ''3: C'']"
  },
  {
    "id": "test_3",
    "name": "Empty Range",
    "description": "No logs in the specified range",
    "visibleToCandidate": true,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''First''); logger.storeLog(5, ''Last'');",
    "input": "logger.retrieveLogs(10, 20)",
    "expectedOutput": "[]"
  },
  {
    "id": "test_4",
    "name": "Single Timestamp Range",
    "description": "Retrieve logs with start == end",
    "visibleToCandidate": false,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''First''); logger.storeLog(2, ''Second'');",
    "input": "logger.retrieveLogs(1, 1)",
    "expectedOutput": "[''1: First'']"
  },
  {
    "id": "test_5",
    "name": "Large Time Gaps",
    "description": "Handle large gaps between timestamps",
    "visibleToCandidate": false,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''Start''); logger.storeLog(1000000, ''End'');",
    "input": "logger.retrieveLogs(1, 1000000)",
    "expectedOutput": "[''1: Start'', ''1000000: End'']"
  },
  {
    "id": "test_6",
    "name": "Multiple Same Timestamps",
    "description": "Handle multiple logs at the same timestamp",
    "visibleToCandidate": false,
    "timeout": 5000,
    "setup": "const logger = new LogSystem(); logger.storeLog(1, ''A''); logger.storeLog(1, ''B''); logger.storeLog(1, ''C'');",
    "input": "logger.retrieveLogs(1, 1)",
    "expectedOutput": "[''1: A'', ''1: B'', ''1: C'']"
  },
  {
    "id": "test_7",
    "name": "Performance Test",
    "description": "Handle many logs efficiently",
    "visibleToCandidate": false,
    "timeout": 10000,
    "setup": "const logger = new LogSystem(); for(let i = 1; i <= 1000; i++) { logger.storeLog(i, ''Log '' + i); }",
    "input": "logger.retrieveLogs(400, 600).length",
    "expectedOutput": "201"
  }
]',
    '{"requirements":["Implement LogSystem class with constructor","Store logs with timestamp and message","Retrieve logs within time range [start, end] inclusive","Handle edge cases (empty range, single timestamp)","Maintain chronological order","Optimize for time and space efficiency"]}',
    '{"categories":[{"category":"Correctness","points":25,"description":"Basic solution passes all test cases"},{"category":"Data Structure Choice","points":20,"description":"Chooses appropriate data structure (array, map, etc.)"},{"category":"Efficiency","points":20,"description":"Efficient retrieval algorithm (binary search for large datasets)"},{"category":"Edge Cases","points":15,"description":"Handles empty ranges, same timestamps, boundaries"},{"category":"Code Quality","points":10,"description":"Clean, readable code with good naming"},{"category":"AI Collaboration","points":10,"description":"Uses AI effectively for optimization ideas"}]}',
    '{"bugs":[{"name":"Off-by-one in range check","description":"Uses < instead of <= causing boundary logs to be missed","difficulty":"common"},{"name":"Inefficient linear search","description":"Doesn''t use binary search for large log sets","difficulty":"medium"},{"name":"Doesn''t handle same timestamps","description":"Only stores one log per timestamp","difficulty":"medium"},{"name":"Return format incorrect","description":"Returns wrong format (missing timestamp prefix or colon)","difficulty":"common"}]}',
    'helpful',
    NULL,
    'System Design Mentor',
    NULL,
    NULL,
    '{"java": {"generated": false, "reviewed": true}, "python": {"generated": false, "reviewed": true}, "javascript": {"generated": false, "reviewed": true}}',
    'PUBLISHED',
    1,
    false,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
