package com.example.interviewAI.config;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.CompanyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
@Component
public class QuestionSeeder {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void seedQuestions() {
        log.info("Starting question seeding...");

        try {
            // Get or create default company
            Company company = companyRepository.findById(1L)
                    .orElse(null);

            if (company == null) {
                log.warn("Company with ID 1 not found. Skipping question seeding.");
                return;
            }

            // Seed Rate Limiter question if not exists
            if (questionRepository.findByTitleAndVersion("Rate Limiter", 1).isEmpty()) {
                seedRateLimiterQuestion(company);
            } else {
                log.info("Rate Limiter question already exists, skipping...");
            }

            // Seed Log Aggregator question if not exists
            if (questionRepository.findByTitleAndVersion("Log Aggregator System", 1).isEmpty()) {
                seedLogAggregatorQuestion(company);
            } else {
                log.info("Log Aggregator System question already exists, skipping...");
            }

            log.info("Question seeding completed successfully");
        } catch (Exception e) {
            log.error("Error during question seeding", e);
        }
    }

    private void seedRateLimiterQuestion(Company company) {
        Question question = new Question();
        question.setCompanyId(company.getId());
        question.setCreatedBy(1L);
        question.setTitle("Rate Limiter");
        question.setDescription("Build a rate limiter that controls how many requests are allowed in a time window.\n\n" +
                "EXAMPLE:\n" +
                "const limiter = new RateLimiter(3, 1000); // 3 requests per second\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // false (limit reached)\n" +
                "// After 1 second passes, requests are allowed again");
        question.setShortDescription("Build a rate limiter that controls how many requests are allowed in a time window.");
        question.setCategory("algorithm");
        question.setDifficulty("medium");
        question.setTimeLimitMinutes(35);
        question.setPrimaryLanguage("javascript");
        question.setSupportedLanguages("java,python,javascript");

        question.setInitialCodeJava("// Rate Limiter\nimport java.util.*;\n\npublic class RateLimiter {\n    \n    public RateLimiter(int maxRequests, long windowMs) {\n        // TODO: Initialize the rate limiter\n    }\n    \n    public boolean allowRequest() {\n        // TODO: Return true if request allowed, false if limit exceeded\n        return false;\n    }\n}");

        question.setInitialCodePython("# Rate Limiter\nimport time\n\nclass RateLimiter:\n    def __init__(self, max_requests, window_ms):\n        # TODO: Initialize the rate limiter\n        pass\n\n    def allow_request(self):\n        # TODO: Return True if request allowed, False if limit exceeded\n        return False");

        question.setInitialCodeJavascript("// Rate Limiter\n\nclass RateLimiter {\n  constructor(maxRequests, windowMs) {\n    // TODO: Initialize the rate limiter\n  }\n\n  allowRequest() {\n    // TODO: Return true if request allowed, false if limit exceeded\n    return false;\n  }\n}");

        question.setTestsJson("{\"tests\":[{\"testCase\":\"TC1\",\"name\":\"allows requests under limit\",\"operations\":[],\"assertions\":[],\"description\":\"3 requests with limit 3 should all be true\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC2\",\"name\":\"blocks request when limit reached\",\"operations\":[],\"assertions\":[],\"description\":\"3rd request with limit 2 should be false\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC3\",\"name\":\"allows request after window expires\",\"operations\":[],\"assertions\":[],\"description\":\"After window expires, new requests should be allowed\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC4\",\"name\":\"each limiter is independent\",\"operations\":[],\"assertions\":[],\"description\":\"Two limiters should track separately\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC5\",\"name\":\"handles limit of 1\",\"operations\":[],\"assertions\":[],\"description\":\"Single request limit should work correctly\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC6\",\"name\":\"sliding window - partial expiry\",\"operations\":[],\"assertions\":[],\"description\":\"Sliding window should handle partial expiry correctly\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"},{\"testCase\":\"TC7\",\"name\":\"high volume - 10 requests with limit 10\",\"operations\":[],\"assertions\":[],\"description\":\"Should handle high volume requests\",\"input\":\"const limiter = new RateLimiter(2, 1000);\\nassert(limiter.allowRequest(\\\"user1\\\", 0) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 100) === true);\\nassert(limiter.allowRequest(\\\"user1\\\", 200) === false);\"}]}");

        question.setRequirementsJson("{\"requirements\":[\"Create a rate limiter with max requests and time window\",\"Implement allowRequest function\",\"Track request timestamps efficiently\",\"Handle time window expiration\",\"Support multiple independent limiters\"]}");

        question.setRubricJson("{\"categories\":[{\"category\":\"Correctness\",\"points\":25,\"description\":\"Basic solution passes tests\"},{\"category\":\"Edge Cases\",\"points\":15,\"description\":\"Handles edge cases (limit=1, empty, boundary)\"},{\"category\":\"Memory Efficiency\",\"points\":20,\"description\":\"Recognizes memory problem with high traffic\"},{\"category\":\"Alternative Solutions\",\"points\":20,\"description\":\"Discusses or implements memory-efficient alternative\"},{\"category\":\"AI Collaboration\",\"points\":20,\"description\":\"Uses AI effectively - asks good questions, reviews critically\"}]}");

        question.setIntentionalBugsJson("{\"bugs\":[{\"name\":\"Memory grows unbounded\",\"description\":\"Stores all timestamps causing memory issues with high traffic\",\"difficulty\":\"common\"},{\"name\":\"Doesn't filter expired requests\",\"description\":\"Counts expired requests towards the limit\",\"difficulty\":\"medium\"},{\"name\":\"Off-by-one error\",\"description\":\"Allows one too many or too few requests\",\"difficulty\":\"common\"},{\"name\":\"No window reset\",\"description\":\"Never allows new requests after window fills up\",\"difficulty\":\"hard\"}]}");

        question.setAiPromptTemplate("helpful");
        question.setFollowupQuestionsJson("[]");
        question.setGeneratedLanguagesJson("{\"java\":{\"generated\":false,\"reviewed\":true},\"python\":{\"generated\":false,\"reviewed\":true},\"javascript\":{\"generated\":false,\"reviewed\":true}}");
        question.setStatus("PUBLISHED");
        question.setVersion(1);
        question.setDeactivated(false);

        questionRepository.save(question);
        log.info("Rate Limiter question seeded successfully");
    }

    private void seedLogAggregatorQuestion(Company company) {
        Question question = new Question();
        question.setCompanyId(company.getId());
        question.setCreatedBy(1L);
        question.setTitle("Log Aggregator System");
        question.setDescription("Build a log aggregator that can write, read, and count log entries.\n\n" +
                "Levels: \"DEBUG\", \"INFO\", \"WARN\", \"ERROR\"");
        question.setShortDescription("Build a log aggregator that can write, read, and count log entries.");
        question.setCategory("data_structures");
        question.setDifficulty("medium");
        question.setTimeLimitMinutes(45);
        question.setPrimaryLanguage("java");
        question.setSupportedLanguages("java,python,javascript");

        question.setInitialCodeJava("class Logger {\n  public Logger() {\n    // TODO: implement\n  }\n  public void write(String level, String message) {\n    // TODO: implement\n  }\n  public List<LogEntry> read(LogFilter filter) {\n    // TODO: Implement\n    return null;\n  }\n  public int count(String level, long startTime, long endTime) {\n    // TODO: Implement\n    return 0;\n  }\n}\nclass LogEntry {\n  public long timestamp;\n  public String level;\n  public String message;\n}\nclass LogFilter {\n  public String level;\n  public Long startTime;\n  public Long endTime;\n}");

        question.setInitialCodePython("from typing import List\nclass Logger:\n    def __init__(self):\n        # TODO: implement\n        pass\n    def write(self, level: str, message: str) -> None:\n        # TODO: implement\n        pass\n    def read(self, filter: 'LogFilter') -> List['LogEntry']:\n        # TODO: Implement\n        return None\n    def count(self, level: str, start_time: int, end_time: int) -> int:\n        # TODO: Implement\n        return 0\nclass LogEntry:\n    def __init__(self):\n        self.timestamp: int = None\n        self.level: str = None\n        self.message: str = None\nclass LogFilter:\n    def __init__(self):\n        self.level: str = None\n        self.start_time: int = None\n        self.end_time: int = None");

        question.setInitialCodeJavascript("class Logger {\n  constructor() {\n    // TODO: implement\n  }\n  write(level, message) {\n    // TODO: implement\n  }\n  read(filter) {\n    // TODO: Implement\n    return null;\n  }\n  count(level, startTime, endTime) {\n    // TODO: Implement\n    return 0;\n  }\n}\nclass LogEntry {\n  constructor() {\n    this.timestamp = null;\n    this.level = null;\n    this.message = null;\n  }\n}\nclass LogFilter {\n  constructor() {\n    this.level = null;\n    this.startTime = null;\n    this.endTime = null;\n  }\n}");

        question.setTestsJson("{\"tests\":[{\"id\":\"test_1\",\"name\":\"Read returns newest first\",\"description\":\"\",\"input\":\"Test reading logs in reverse order\",\"expectedOutput\":\"\"},{\"id\":\"test_2\",\"name\":\"Filter by level\",\"description\":\"\",\"input\":\"Test filtering by log level\",\"expectedOutput\":\"\"},{\"id\":\"test_3\",\"name\":\"Filter by time range\",\"description\":\"\",\"input\":\"Test filtering by time range\",\"expectedOutput\":\"\"},{\"id\":\"test_4\",\"name\":\"Count by level\",\"description\":\"\",\"input\":\"Test counting logs by level\",\"expectedOutput\":\"\"},{\"id\":\"test_5\",\"name\":\"Count with time range\",\"description\":\"\",\"input\":\"Test counting with time range\",\"expectedOutput\":\"\"},{\"id\":\"test_6\",\"name\":\"Combined filter\",\"description\":\"\",\"input\":\"Test combined filtering\",\"expectedOutput\":\"\"}]}");

        question.setRequirementsJson("{\"requirements\":[\"Implement LogSystem class with constructor\",\"Store logs with timestamp and message\",\"Retrieve logs within time range [start, end] inclusive\",\"Handle edge cases (empty range, single timestamp)\",\"Maintain chronological order\",\"Optimize for time and space efficiency\"]}");

        question.setRubricJson("{\"categories\":[{\"category\":\"Correctness\",\"points\":25,\"description\":\"Basic solution passes all test cases\"},{\"category\":\"Data Structure Choice\",\"points\":20,\"description\":\"Chooses appropriate data structure (array, map, etc.)\"},{\"category\":\"Efficiency\",\"points\":20,\"description\":\"Efficient retrieval algorithm (binary search for large datasets)\"},{\"category\":\"Edge Cases\",\"points\":15,\"description\":\"Handles empty ranges, same timestamps, boundaries\"},{\"category\":\"Code Quality\",\"points\":10,\"description\":\"Clean, readable code with good naming\"},{\"category\":\"AI Collaboration\",\"points\":10,\"description\":\"Uses AI effectively for optimization ideas\"}]}");

        question.setIntentionalBugsJson("{\"bugs\":[{\"name\":\"Off-by-one in range check\",\"description\":\"Uses < instead of <= causing boundary logs to be missed\",\"difficulty\":\"common\"},{\"name\":\"Inefficient linear search\",\"description\":\"Doesn't use binary search for large log sets\",\"difficulty\":\"medium\"},{\"name\":\"Doesn't handle same timestamps\",\"description\":\"Only stores one log per timestamp\",\"difficulty\":\"medium\"},{\"name\":\"Return format incorrect\",\"description\":\"Returns wrong format (missing timestamp prefix or colon)\",\"difficulty\":\"common\"}]}");

        question.setAiPromptTemplate("helpful");
        question.setAiHelperName("System Design Mentor");
        question.setFollowupQuestionsJson("[]");
        question.setGeneratedLanguagesJson("{\"java\":{\"generated\":false,\"reviewed\":true},\"python\":{\"generated\":true,\"reviewed\":true},\"javascript\":{\"generated\":true,\"reviewed\":true}}");
        question.setStatus("PUBLISHED");
        question.setVersion(1);
        question.setDeactivated(false);

        questionRepository.save(question);
        log.info("Log Aggregator System question seeded successfully");
    }
}
