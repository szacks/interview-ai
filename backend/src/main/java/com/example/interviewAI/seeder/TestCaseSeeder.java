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

                // Define comprehensive test cases for Rate Limiter
                String[][] testDefinitions = {
                    // Basic functionality tests
                    {"25", "allows requests under limit", "TC1", "3 requests with limit 3 should all succeed",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[3,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true}"},

                    {"26", "blocks request when limit exceeded", "TC2", "4th request with limit 3 should be blocked",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[3,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":false}"},

                    // Edge case: limit of 1
                    {"27", "handles limit of 1", "TC3", "Only first request allowed with limit 1",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[1,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"}]",
                     "{\"r1\":true,\"r2\":false,\"r3\":false}"},

                    // Window expiry test
                    {"28", "allows requests after window expires", "TC4", "Request allowed after 150ms with 100ms window",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[1,100]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"sleep\",\"ms\":150},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"}]",
                     "{\"r1\":true,\"r2\":false,\"r3\":true}"},

                    // Multiple blocked requests then recovery
                    {"29", "multiple blocks then window reset", "TC5", "Multiple blocked requests, then allowed after window",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[2,100]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"},{\"type\":\"sleep\",\"ms\":150},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r5\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r6\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":false,\"r4\":false,\"r5\":true,\"r6\":true}"},

                    // High volume test - exactly at limit
                    {"30", "high volume at exact limit", "TC6", "10 requests with limit 10 should all succeed",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[10,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r5\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r6\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r7\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r8\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r9\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r10\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":true,\"r5\":true,\"r6\":true,\"r7\":true,\"r8\":true,\"r9\":true,\"r10\":true}"},

                    // High volume test - exceeding limit
                    {"31", "high volume exceeds limit", "TC7", "11th request with limit 10 should be blocked",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[10,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r5\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r6\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r7\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r8\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r9\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r10\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r11\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":true,\"r5\":true,\"r6\":true,\"r7\":true,\"r8\":true,\"r9\":true,\"r10\":true,\"r11\":false}"},

                    // Independent limiters test
                    {"32", "multiple independent limiters", "TC8", "Two limiters with different limits work independently",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter1\",\"args\":[1,1000]},{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter2\",\"args\":[3,1000]},{\"type\":\"call\",\"var\":\"limiter1\",\"method\":\"allowRequest\",\"store\":\"a1\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"b1\"},{\"type\":\"call\",\"var\":\"limiter1\",\"method\":\"allowRequest\",\"store\":\"a2\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"b2\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"b3\"},{\"type\":\"call\",\"var\":\"limiter2\",\"method\":\"allowRequest\",\"store\":\"b4\"}]",
                     "{\"a1\":true,\"b1\":true,\"a2\":false,\"b2\":true,\"b3\":true,\"b4\":false}"},

                    // Burst then wait pattern
                    {"33", "burst then wait pattern", "TC9", "Burst of requests, wait, then more requests",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[3,100]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r2\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r3\"},{\"type\":\"sleep\",\"ms\":150},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r4\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r5\"},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r6\"}]",
                     "{\"r1\":true,\"r2\":true,\"r3\":true,\"r4\":true,\"r5\":true,\"r6\":true}"},

                    // First request always allowed
                    {"34", "first request always allowed", "TC10", "Very first request to any limiter should succeed",
                     "[{\"type\":\"create\",\"class\":\"RateLimiter\",\"var\":\"limiter\",\"args\":[5,1000]},{\"type\":\"call\",\"var\":\"limiter\",\"method\":\"allowRequest\",\"store\":\"r1\"}]",
                     "{\"r1\":true}"}
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
