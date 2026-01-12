-- Add Log Aggregator System question with company_id = 1
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

  public List <logentry>read(LogFilter filter) {
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
    '{"tests":[{"id":"test_1768214677979_lbq3v52","name":"Read returns newest first","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"INFO\", \"First\");\nlogger.write(\"INFO\", \"Second\");\nlogger.write(\"INFO\", \"Third\");\nLogFilter filter = new LogFilter();\nList<LogEntry> logs = logger.read(filter);\nassert logs.get(0).message.equals(\"Third\");\nassert logs.get(2).message.equals(\"First\");\n","expectedOutput":"","visibleToCandidate":true,"timeout":5000},{"id":"test_1768218740849_z781kma","name":"Filter by level","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"INFO\", \"Info msg\");\nlogger.write(\"ERROR\", \"Error msg\");\nlogger.write(\"INFO\", \"Info msg 2\");\nLogFilter filter = new LogFilter();\nfilter.level = \"ERROR\";\nassert logger.read(filter).size() == 1;\nfilter.level = \"INFO\";\nassert logger.read(filter).size() == 2;","expectedOutput":"","visibleToCandidate":true,"timeout":5000},{"id":"test_1768218784599_502pema","name":"Filter by time range","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"INFO\", \"Before\");          // t=1000\nlogger.write(\"INFO\", \"In range 1\");      // t=1500\nlogger.write(\"INFO\", \"In range 2\");      // t=2000\nlogger.write(\"INFO\", \"After\");           // t=3000\n// Manually set timestamps for deterministic test\nList<LogEntry> all = logger.read(new LogFilter());\nall.get(0).timestamp = 3000;\nall.get(1).timestamp = 2000;\nall.get(2).timestamp = 1500;\nall.get(3).timestamp = 1000;\nLogFilter filter = new LogFilter();\nfilter.startTime = 1500L;\nfilter.endTime = 2500L;\nassert logger.read(filter).size() == 2;","expectedOutput":"","visibleToCandidate":true,"timeout":5000},{"id":"test_1768218822672_9qsmotv","name":"Count by level","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"ERROR\", \"E1\");\nlogger.write(\"ERROR\", \"E2\");\nlogger.write(\"ERROR\", \"E3\");\nlogger.write(\"INFO\", \"I1\");\nlogger.write(\"WARN\", \"W1\");\nassert logger.count(\"ERROR\", null, null) == 3;\nassert logger.count(\"INFO\", null, null) == 1;\nassert logger.count(\"WARN\", null, null) == 1;\nassert logger.count(\"DEBUG\", null, null) == 0;\n","expectedOutput":"","visibleToCandidate":true,"timeout":5000},{"id":"test_1768218875954_5qt4k5a","name":"Count with time range","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"ERROR\", \"E1\");  // t=1000\nlogger.write(\"ERROR\", \"E2\");  // t=2000\nlogger.write(\"ERROR\", \"E3\");  // t=3000\nList<LogEntry> all = logger.read(new LogFilter());\nall.get(0).timestamp = 3000;\nall.get(1).timestamp = 2000;\nall.get(2).timestamp = 1000;\nassert logger.count(\"ERROR\", 1500L, 2500L) == 1;\nassert logger.count(\"ERROR\", 1000L, 3000L) == 3;\nassert logger.count(\"ERROR\", 5000L, 6000L) == 0;\n\n","expectedOutput":"","visibleToCandidate":true,"timeout":5000},{"id":"test_1768218912772_skbg92f","name":"Combined filter (level + time)","description":"","setup":"","input":"Logger logger = new Logger();\nlogger.write(\"INFO\", \"I1\");   // t=1000\nlogger.write(\"ERROR\", \"E1\");  // t=2000\nlogger.write(\"INFO\", \"I2\");   // t=3000\nlogger.write(\"ERROR\", \"E2\");  // t=4000\nList<LogEntry> all = logger.read(new LogFilter());\nall.get(0).timestamp = 4000;\nall.get(1).timestamp = 3000;\nall.get(2).timestamp = 2000;\nall.get(3).timestamp = 1000;\nLogFilter filter = new LogFilter();\nfilter.level = \"INFO\";\nfilter.startTime = 2000L;\nfilter.endTime = 4000L;\nassert logger.read(filter).size() == 1;\nassert logger.read(filter).get(0).message.equals(\"I2\");\n       ","expectedOutput":"","visibleToCandidate":true,"timeout":5000}]}',
    '{"requirements":["Implement LogSystem class with constructor","Store logs with timestamp and message","Retrieve logs within time range [start, end] inclusive","Handle edge cases (empty range, single timestamp)","Maintain chronological order","Optimize for time and space efficiency"]}',
    '{"categories":[{"category":"Correctness","points":25,"description":"Basic solution passes all test cases"},{"category":"Data Structure Choice","points":20,"description":"Chooses appropriate data structure (array, map, etc.)"},{"category":"Efficiency","points":20,"description":"Efficient retrieval algorithm (binary search for large datasets)"},{"category":"Edge Cases","points":15,"description":"Handles empty ranges, same timestamps, boundaries"},{"category":"Code Quality","points":10,"description":"Clean, readable code with good naming"},{"category":"AI Collaboration","points":10,"description":"Uses AI effectively for optimization ideas"}]}',
    '{"bugs":[{"name":"Off-by-one in range check","description":"Uses < instead of <= causing boundary logs to be missed","difficulty":"common"},{"name":"Inefficient linear search","description":"Doesn''t use binary search for large log sets","difficulty":"medium"},{"name":"Doesn''t handle same timestamps","description":"Only stores one log per timestamp","difficulty":"medium"},{"name":"Return format incorrect","description":"Returns wrong format (missing timestamp prefix or colon)","difficulty":"common"}]}',
    'helpful',
    NULL,
    'System Design Mentor',
    NULL,
    '[{"id":"fq_1768214709375_bxruwa7","question":"Walk me through the time complexity of your read() and count() methods","expectedAnswer":"\n1. inMemory:\n\n\"approach\": \"Store all logs in List, filter in code\",\n\n\"readComplexity\": \"O(n) - scan all logs, filter matches\",\n\n\"countComplexity\": \"O(n) - scan all logs, count matches\"\n\n2. memory with Level Index:\n\n\"approach\": \"Separate list per level: Map<String, List<LogEntry>>\",\n\n\"readComplexity\": \"O(k) - where k is logs with that level\",\n\n\"countComplexity\": \"O(k) - only scan relevant level\"\n\n3.fileBased:\n\n\"approach\": \"Separate file per level or time period\",\n\n\"readComplexity\": \"O(m) - where m is bytes to read from disk\",\n\n\"countComplexity\": \"Same, but with I/O overhead\"\n\n4.database:\n\n\"approach\": \"Indexed database with WHERE clauses\",\n\n\"readComplexity\": \"O(log n) with index - near instant\",\n\n\"countComplexity\": \"O(log n) - uses COUNT(*) with index\""},{"id":"fq_1768214741880_fsqk2vn","question":"How would you optimise count() if we only care about total counts (not time-filtered)?","expectedAnswer":"Cache counts that don''t depend on time filtering. Keep running totals that update on write()"},{"id":"fq_1768214773847_vnii7px","question":"If multiple threads call write() at the same time, what happens? if needed- give me a solution to the problem","expectedAnswer":"1. File-based, in-memory, or NoSQL database:\n\nData can become corrupted when multiple threads write simultaneously. The solution is to have all writes go to a queue, where a single writer thread processes them sequentially.\n\n2. SQL database:\n\nSQL databases handle thread safety automatically through built-in locking mechanisms."},{"id":"fq_1768214801003_7hdshrg","question":"If you have 10 microservices, how do you aggregate their logs into one place?","expectedAnswer":"Each service still has its own logger. Logs are written to a standard output (or local file) in a consistent format.\n\nA collector picks up the logs, adds metadata like service name / instance / environment / requestId, and ships them to a central store."}]',
    '{"java":{"generated":false,"reviewed":true},"python":{"generated":true,"reviewed":true},"javascript":{"generated":true,"reviewed":true}}',
    'PUBLISHED',
    7,
    false,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;
