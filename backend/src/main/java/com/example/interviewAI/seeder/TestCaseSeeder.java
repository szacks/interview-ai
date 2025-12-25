package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.TestCaseRepository;
import com.example.interviewAI.repository.QuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class TestCaseSeeder implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TestCaseRepository testCaseRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void run(String... args) throws Exception {
        // Check if test cases already exist
        long existingCount = testCaseRepository.count();

        if (existingCount == 0) {
            log.info("Starting test cases seeding...");
            seedTestCases();
            log.info("Test cases seeding completed successfully");
        } else {
            log.info("Test cases already exist in database, skipping initial seeding");
            // Update Rate Limiter test cases with proper definitions
            updateRateLimiterTestCases();
        }
    }

    private void seedTestCases() {
        List<Question> allQuestions = questionRepository.findAll();

        for (Question question : allQuestions) {
            try {
                List<TestCase> testCases = parseTestsFromJson(question);
                if (!testCases.isEmpty()) {
                    testCaseRepository.saveAll(testCases);
                    log.info("Migrated {} test cases for question: {}", testCases.size(), question.getTitle());
                }
            } catch (Exception e) {
                log.error("Error parsing test cases for question {}: {}", question.getTitle(), e.getMessage(), e);
            }
        }
    }

    private void updateRateLimiterTestCases() {
        try {
            List<Question> rateLimiterQuestions = questionRepository.findByTitle("Rate Limiter");
            if (rateLimiterQuestions.isEmpty()) {
                return;
            }

            Question rateLimiter = rateLimiterQuestions.get(0);
            List<TestCase> existingTestCases = testCaseRepository.findByQuestionIdOrderByOrderIndex(rateLimiter.getId());

            // Always update Rate Limiter test cases with proper definitions
            if (!existingTestCases.isEmpty()) {
                log.info("Updating Rate Limiter test cases with proper test definitions");

                // Define test cases for Rate Limiter
                String[][] testDefinitions = {
                    {"25", "allows requests under limit", "TC1", "3 requests with limit 3 should all be true",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[3,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result3\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"result1\":true,\"result2\":true,\"result3\":true}}]",
                     "{\"result1\":true,\"result2\":true,\"result3\":true}"},
                    {"26", "blocks request when limit reached", "TC2", "3rd request with limit 2 should be false",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[2,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result3\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"result1\":true,\"result2\":true,\"result3\":false}}]",
                     "{\"result1\":true,\"result2\":true,\"result3\":false}"},
                    {"27", "allows request after window expires", "TC3", "After window expires, new requests should be allowed",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[1,100]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result1\"},{\"type\":\"sleep\",\"ms\":150},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result2\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"result1\":true,\"result2\":true}}]",
                     "{\"result1\":true,\"result2\":true}"},
                    {"28", "each limiter is independent", "TC4", "Two limiters should track separately",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter1\",\"args\":[1,1000]},{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter2\",\"args\":[2,1000]},{\"type\":\"call\",\"var\":\"limiter1\",\"method\":\"allowRequest\",\"store\":\"r1_1\"},{\"type\":\"call\",\"var\":\"limiter1\",\"method\":\"allowRequest\",\"store\":\"r1_2\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"r2_1\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"r2_2\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"r2_3\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"r1_1\":true,\"r1_2\":false,\"r2_1\":true,\"r2_2\":true,\"r2_3\":false}}]",
                     "{\"r1_1\":true,\"r1_2\":false,\"r2_1\":true,\"r2_2\":true,\"r2_3\":false}"},
                    {"29", "handles limit of 1", "TC5", "Single request limit should work correctly",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[1,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"result2\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"result1\":true,\"result2\":false}}]",
                     "{\"result1\":true,\"result2\":false}"},
                    {"30", "sliding window - partial expiry", "TC6", "Sliding window should handle partial expiry correctly",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[3,100]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"},{\"type\":\"sleep\",\"ms\":50},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r5\"},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":false,\"r5\":true}}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":false,\"r5\":true}"},
                    {"31", "high volume - 10 requests with limit 10", "TC7", "Should handle high volume requests",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[10,1000]},{\"type\":\"assign\",\"var\":\"result\",\"value\":{\"success\":true}}]",
                     "{\"success\":true}"}
                };

                for (int i = 0; i < testDefinitions.length && i < existingTestCases.size(); i++) {
                    TestCase tc = existingTestCases.get(i);
                    tc.setOperationsJson(testDefinitions[i][4]);
                    tc.setAssertionsJson(testDefinitions[i][5]);
                    testCaseRepository.save(tc);
                }

                log.info("Updated {} Rate Limiter test cases", existingTestCases.size());
            }
        } catch (Exception e) {
            log.warn("Failed to update Rate Limiter test cases: {}", e.getMessage());
        }
    }

    private List<TestCase> parseTestsFromJson(Question question) throws Exception {
        List<TestCase> testCases = new ArrayList<>();

        if (question.getTestsJson() == null || question.getTestsJson().isEmpty()) {
            return testCases;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(question.getTestsJson());
            JsonNode testsArray = rootNode.get("tests");

            if (testsArray != null && testsArray.isArray()) {
                int orderIndex = 0;
                for (JsonNode testNode : testsArray) {
                    TestCase testCase = new TestCase();
                    testCase.setQuestion(question);

                    // Extract fields from JSON
                    String testName = testNode.has("name") ? testNode.get("name").asText() : "Test";
                    String testCaseId = testNode.has("testCase") ? testNode.get("testCase").asText() : String.valueOf(orderIndex);
                    String description = testNode.has("description") ? testNode.get("description").asText() : "";

                    testCase.setTestName(testName);
                    testCase.setTestCase(testCaseId);
                    testCase.setDescription(description);

                    // Store complex JSON data as-is
                    testCase.setOperationsJson(testNode.has("operations") ? testNode.get("operations").toString() :
                                             testNode.has("input") ? objectMapper.writeValueAsString(testNode.get("input")) : "[]");
                    testCase.setAssertionsJson(testNode.has("assertions") ? testNode.get("assertions").toString() :
                                             testNode.has("expected") ? objectMapper.writeValueAsString(testNode.get("expected")) : "");

                    testCase.setOrderIndex(orderIndex);
                    testCase.setPassed(false); // Tests start as not passed

                    testCases.add(testCase);
                    orderIndex++;
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse test cases JSON for question {}: {}", question.getTitle(), e.getMessage());
            throw e;
        }

        return testCases;
    }
}
