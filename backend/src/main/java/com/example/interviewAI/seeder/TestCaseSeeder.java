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
            log.info("Test cases already exist in database, skipping seeding");
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
