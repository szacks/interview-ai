package com.example.interviewAI.util;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.FollowUpQuestion;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.repository.QuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Utility class to restore questions from JSON backup files.
 *
 * Usage:
 * 1. Place JSON backup files in: src/main/resources/question-backups/
 * 2. Run with: mvn spring-boot:run -Dspring-boot.run.arguments="--restore-questions"
 * 3. Or use the restoreFromFile() method programmatically
 *
 * This will restore questions only if they don't already exist (based on title).
 */
@Component
public class QuestionBackupRestorer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(QuestionBackupRestorer.class);

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Only run if --restore-questions flag is present
        for (String arg : args) {
            if ("--restore-questions".equals(arg)) {
                logger.info("Starting question backup restoration...");
                restoreAllBackups();
                break;
            }
        }
    }

    /**
     * Restore all question backup files from the question-backups directory
     */
    public void restoreAllBackups() {
        try {
            // List of backup files to restore
            String[] backupFiles = {
                "question-rate-limiter.json",
                "question-rate-limiter-actual.json",
                "question-two-sum.json",
                "question-binary-search.json",
                "question-log-system.json"
                // Add more backup files here as needed
            };

            int restored = 0;
            int skipped = 0;
            int failed = 0;

            for (String filename : backupFiles) {
                try {
                    boolean success = restoreFromFile("classpath:question-backups/" + filename);
                    if (success) {
                        restored++;
                    } else {
                        skipped++;
                    }
                } catch (Exception e) {
                    logger.error("Failed to restore {}: {}", filename, e.getMessage());
                    failed++;
                }
            }

            logger.info("Restoration complete: {} restored, {} skipped (already exist), {} failed",
                       restored, skipped, failed);

        } catch (Exception e) {
            logger.error("Error during backup restoration: {}", e.getMessage(), e);
        }
    }

    /**
     * Restore a single question from a JSON backup file
     *
     * @param resourcePath Path to the JSON backup file (e.g., "classpath:question-backups/question-two-sum.json")
     * @return true if restored, false if already exists
     */
    public boolean restoreFromFile(String resourcePath) throws IOException {
        logger.info("Restoring question from: {}", resourcePath);

        // Load the resource
        Resource resource = resourceLoader.getResource(resourcePath);
        if (!resource.exists()) {
            throw new IOException("Backup file not found: " + resourcePath);
        }

        // Parse JSON
        JsonNode root = objectMapper.readTree(resource.getInputStream());
        JsonNode questionNode = root.get("question");

        String title = questionNode.get("title").asText();

        // Check if question already exists
        List<Question> existingQuestions = questionRepository.findByTitle(title);
        if (!existingQuestions.isEmpty()) {
            logger.info("Question '{}' already exists, skipping", title);
            return false;
        }

        // Create Question entity
        Question question = new Question();

        // Basic fields
        question.setCompanyId(questionNode.has("companyId") && !questionNode.get("companyId").isNull()
                              ? questionNode.get("companyId").asLong() : null);
        question.setCreatedBy(questionNode.has("createdBy") && !questionNode.get("createdBy").isNull()
                              ? questionNode.get("createdBy").asLong() : null);
        question.setTitle(title);
        question.setDescription(questionNode.get("description").asText());
        question.setShortDescription(getTextOrNull(questionNode, "shortDescription"));
        question.setCategory(getTextOrNull(questionNode, "category"));
        question.setDifficulty(questionNode.get("difficulty").asText());

        // Time and language settings
        question.setTimeLimitMinutes(getIntOrNull(questionNode, "timeLimitMinutes"));
        question.setPrimaryLanguage(getTextOrNull(questionNode, "primaryLanguage"));
        question.setSupportedLanguages(getTextOrNull(questionNode, "supportedLanguages"));

        // Code templates
        question.setInitialCodeJava(getTextOrNull(questionNode, "initialCodeJava"));
        question.setInitialCodePython(getTextOrNull(questionNode, "initialCodePython"));
        question.setInitialCodeJavascript(getTextOrNull(questionNode, "initialCodeJavascript"));

        // JSON fields
        question.setTestsJson(getTextOrNull(questionNode, "testsJson"));
        question.setRequirementsJson(getTextOrNull(questionNode, "requirementsJson"));
        question.setRubricJson(getTextOrNull(questionNode, "rubricJson"));
        question.setIntentionalBugsJson(getTextOrNull(questionNode, "intentionalBugsJson"));
        question.setFollowupQuestionsJson(getTextOrNull(questionNode, "followupQuestionsJson"));
        question.setGeneratedLanguagesJson(getTextOrNull(questionNode, "generatedLanguagesJson"));

        // AI configuration
        question.setAiPromptTemplate(getTextOrNull(questionNode, "aiPromptTemplate"));
        question.setAiCustomPrompt(getTextOrNull(questionNode, "aiCustomPrompt"));
        question.setAiHelperName(getTextOrNull(questionNode, "aiHelperName"));
        // Note: agentTemplate needs to be set separately if needed

        // Status and versioning
        question.setStatus(questionNode.has("status") ? questionNode.get("status").asText() : "PUBLISHED");
        question.setVersion(questionNode.has("version") ? questionNode.get("version").asInt() : 1);
        question.setParentQuestionId(questionNode.has("parentQuestionId") && !questionNode.get("parentQuestionId").isNull()
                                     ? questionNode.get("parentQuestionId").asLong() : null);
        question.setCurrentStep(questionNode.has("currentStep") ? questionNode.get("currentStep").asInt() : 7);

        // Analytics
        question.setUsageCount(questionNode.has("usageCount") ? questionNode.get("usageCount").asInt() : 0);
        question.setDeactivated(questionNode.has("deactivated") ? questionNode.get("deactivated").asBoolean() : false);

        // Timestamps
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());
        if ("PUBLISHED".equals(question.getStatus())) {
            question.setPublishedAt(LocalDateTime.now());
        }

        // Parse and add FollowUpQuestions
        if (root.has("followUpQuestions") && root.get("followUpQuestions").isArray()) {
            List<FollowUpQuestion> followUpQuestions = new ArrayList<>();
            for (JsonNode fqNode : root.get("followUpQuestions")) {
                FollowUpQuestion fq = new FollowUpQuestion();
                fq.setQuestion(question);
                fq.setQuestionText(fqNode.get("questionText").asText());
                fq.setAnswer(getTextOrNull(fqNode, "answer"));
                fq.setOrderIndex(fqNode.has("orderIndex") ? fqNode.get("orderIndex").asInt() : 0);
                fq.setCreatedAt(LocalDateTime.now());
                followUpQuestions.add(fq);
            }
            question.setFollowUpQuestions(followUpQuestions);
        }

        // Parse and add TestCases
        if (root.has("testCases") && root.get("testCases").isArray()) {
            List<TestCase> testCases = new ArrayList<>();
            for (JsonNode tcNode : root.get("testCases")) {
                TestCase tc = new TestCase();
                tc.setQuestion(question);
                tc.setTestName(tcNode.get("testName").asText());
                tc.setTestCase(getTextOrNull(tcNode, "testCase"));
                tc.setDescription(getTextOrNull(tcNode, "description"));
                tc.setOperationsJson(getTextOrNull(tcNode, "operationsJson"));
                tc.setAssertionsJson(getTextOrNull(tcNode, "assertionsJson"));
                tc.setOrderIndex(tcNode.has("orderIndex") ? tcNode.get("orderIndex").asInt() : 0);
                tc.setPassed(tcNode.has("passed") ? tcNode.get("passed").asBoolean() : false);
                tc.setCreatedAt(LocalDateTime.now());
                testCases.add(tc);
            }
            question.setTestCases(testCases);
        }

        // Save to database
        questionRepository.save(question);
        logger.info("Successfully restored question: {}", title);

        return true;
    }

    /**
     * Restore a specific question by title from backup
     */
    public boolean restoreQuestionByTitle(String questionTitle) throws IOException {
        // Map titles to filenames (you may need to update this mapping)
        String filename = "question-" + questionTitle.toLowerCase()
                                                    .replace(" ", "-")
                                                    .replaceAll("[^a-z0-9-]", "") + ".json";

        return restoreFromFile("classpath:question-backups/" + filename);
    }

    // Helper methods

    private String getTextOrNull(JsonNode node, String fieldName) {
        if (node.has(fieldName) && !node.get(fieldName).isNull()) {
            return node.get(fieldName).asText();
        }
        return null;
    }

    private Integer getIntOrNull(JsonNode node, String fieldName) {
        if (node.has(fieldName) && !node.get(fieldName).isNull()) {
            return node.get(fieldName).asInt();
        }
        return null;
    }
}
