package com.example.interviewAI.util;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.FollowUpQuestion;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.FollowUpQuestionRepository;
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
    private FollowUpQuestionRepository followUpQuestionRepository;

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
                "question-log-aggregator.json"
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

        // Support both flat structure and nested "question" structure
        JsonNode questionNode = root.has("question") ? root.get("question") : root;

        // Log available fields for debugging
        if (questionNode.isObject()) {
            java.util.List<String> fieldNames = new java.util.ArrayList<>();
            questionNode.fieldNames().forEachRemaining(fieldNames::add);
            logger.debug("Available fields in backup file: {}", String.join(", ", fieldNames));
        }

        String title = questionNode.get("title").asText();

        // Check if question already exists - delete it to restore from fresh JSON backup
        List<Question> existingQuestions = questionRepository.findByTitle(title);
        if (!existingQuestions.isEmpty()) {
            logger.info("Question '{}' already exists, deleting old version to restore from JSON", title);
            questionRepository.deleteAll(existingQuestions);
        }

        // Create Question entity
        Question question = new Question();

        // Basic fields (support both camelCase and snake_case)
        question.setCompanyId(getLongOrNull(questionNode, "companyId", "company_id"));
        question.setCreatedBy(getLongOrNull(questionNode, "createdBy", "created_by"));
        question.setTitle(title);

        String description = getTextOrNull(questionNode, "description");
        question.setDescription(description);
        logger.debug("Set description for '{}': {}", title, description != null ? "set" : "null");

        String shortDescription = getTextOrNull(questionNode, "shortDescription", "short_description");
        question.setShortDescription(shortDescription);
        logger.debug("Set shortDescription for '{}': {}", title, shortDescription != null ? "set" : "null");

        question.setCategory(getTextOrNull(questionNode, "category"));
        question.setDifficulty(getTextOrNull(questionNode, "difficulty"));

        // Time and language settings
        question.setTimeLimitMinutes(getIntOrNull(questionNode, "timeLimitMinutes", "time_limit_minutes"));
        question.setPrimaryLanguage(getTextOrNull(questionNode, "primaryLanguage", "primary_language"));
        question.setSupportedLanguages(getTextOrNull(questionNode, "supportedLanguages", "supported_languages"));

        // Code templates
        question.setInitialCodeJava(getTextOrNull(questionNode, "initialCodeJava", "initial_code_java"));
        question.setInitialCodePython(getTextOrNull(questionNode, "initialCodePython", "initial_code_python"));
        question.setInitialCodeJavascript(getTextOrNull(questionNode, "initialCodeJavascript", "initial_code_javascript"));

        // JSON fields
        question.setTestsJson(getTextOrNull(questionNode, "testsJson", "tests_json"));
        question.setRequirementsJson(getTextOrNull(questionNode, "requirementsJson", "requirements_json"));
        question.setRubricJson(getTextOrNull(questionNode, "rubricJson", "rubric_json"));
        question.setIntentionalBugsJson(getTextOrNull(questionNode, "intentionalBugsJson", "intentional_bugs_json"));
        // Note: followupQuestionsJson is deprecated - we use the followUpQuestions entity relationship instead
        question.setGeneratedLanguagesJson(getTextOrNull(questionNode, "generatedLanguagesJson", "generated_languages_json"));

        // AI configuration
        question.setAiPromptTemplate(getTextOrNull(questionNode, "aiPromptTemplate", "ai_prompt_template"));
        question.setAiCustomPrompt(getTextOrNull(questionNode, "aiCustomPrompt", "ai_custom_prompt"));
        question.setAiHelperName(getTextOrNull(questionNode, "aiHelperName", "ai_helper_name"));
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

        // Parse and add FollowUpQuestions (support both nested array and JSON string)
        JsonNode followUpQuestionsNode = null;

        // Try to find followUpQuestions in root (for nested structure like rate-limiter)
        if (root.has("followUpQuestions") && root.get("followUpQuestions").isArray()) {
            followUpQuestionsNode = root.get("followUpQuestions");
            logger.debug("Found followUpQuestions in root for '{}'", title);
        }
        // Try to find in questionNode (for nested "question" object)
        else if (questionNode.has("followUpQuestions") && questionNode.get("followUpQuestions").isArray()) {
            followUpQuestionsNode = questionNode.get("followUpQuestions");
            logger.debug("Found followUpQuestions in questionNode for '{}'", title);
        }
        // Try to find followup_questions_json in questionNode (flat structure like log-aggregator)
        else if (questionNode.has("followup_questions_json")) {
            JsonNode jsonField = questionNode.get("followup_questions_json");
            logger.debug("Found followup_questions_json field for '{}', type: {}", title, jsonField.getNodeType());
            if (jsonField.isArray()) {
                followUpQuestionsNode = jsonField;
                logger.debug("followup_questions_json is an array with {} items", jsonField.size());
            } else if (jsonField.isTextual()) {
                // It's a string containing JSON, parse it
                try {
                    followUpQuestionsNode = objectMapper.readTree(jsonField.asText());
                    logger.debug("Parsed followup_questions_json as JSON string");
                } catch (Exception e) {
                    logger.warn("Failed to parse followup_questions_json for '{}': {}", title, e.getMessage());
                }
            }
        }
        // Also check root level for followup_questions_json (in case of flat structure)
        else if (root.has("followup_questions_json")) {
            JsonNode jsonField = root.get("followup_questions_json");
            logger.debug("Found followup_questions_json in root for '{}'", title);
            if (jsonField.isArray()) {
                followUpQuestionsNode = jsonField;
                logger.debug("followup_questions_json is an array with {} items", jsonField.size());
            } else if (jsonField.isTextual()) {
                try {
                    followUpQuestionsNode = objectMapper.readTree(jsonField.asText());
                } catch (Exception e) {
                    logger.warn("Failed to parse followup_questions_json for '{}': {}", title, e.getMessage());
                }
            }
        }

        // Add follow-up questions if found
        if (followUpQuestionsNode != null && followUpQuestionsNode.isArray()) {
            logger.debug("Processing {} follow-up questions for '{}'", followUpQuestionsNode.size(), title);
            List<FollowUpQuestion> followUpQuestions = new ArrayList<>();
            for (JsonNode fqNode : followUpQuestionsNode) {
                FollowUpQuestion fq = new FollowUpQuestion();
                fq.setQuestion(question);

                // Support both 'questionText' and 'question' field names
                String questionText = null;
                if (fqNode.has("questionText")) {
                    questionText = fqNode.get("questionText").asText();
                    logger.debug("Using questionText field");
                } else if (fqNode.has("question")) {
                    questionText = fqNode.get("question").asText();
                    logger.debug("Using question field");
                } else {
                    logger.debug("No question/questionText field found in follow-up question");
                }

                if (questionText != null) {
                    fq.setQuestionText(questionText);

                    // Support both 'answer' and 'expectedAnswer' field names
                    String answer = null;
                    if (fqNode.has("answer")) {
                        answer = getTextOrNull(fqNode, "answer");
                        logger.debug("Using answer field");
                    } else if (fqNode.has("expectedAnswer")) {
                        answer = getTextOrNull(fqNode, "expectedAnswer");
                        logger.debug("Using expectedAnswer field");
                    }
                    fq.setAnswer(answer);

                    fq.setOrderIndex(fqNode.has("orderIndex") ? fqNode.get("orderIndex").asInt() : 0);
                    fq.setCreatedAt(LocalDateTime.now());
                    followUpQuestions.add(fq);
                    logger.debug("Added follow-up question: {}", questionText);
                }
            }
            if (!followUpQuestions.isEmpty()) {
                question.setFollowUpQuestions(followUpQuestions);
                logger.info("Added {} follow-up questions for '{}'", followUpQuestions.size(), title);
            } else {
                logger.warn("No valid follow-up questions found for '{}' despite having nodes", title);
            }
        } else {
            logger.debug("No follow-up questions found for '{}'", title);
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
        Question savedQuestion = questionRepository.save(question);
        logger.info("Saved question: {}", title);

        // Explicitly save follow-up questions to ensure they are persisted
        if (savedQuestion.getFollowUpQuestions() != null && !savedQuestion.getFollowUpQuestions().isEmpty()) {
            logger.info("About to save {} follow-up questions for '{}' (Question ID: {})",
                savedQuestion.getFollowUpQuestions().size(), title, savedQuestion.getId());

            for (FollowUpQuestion fq : savedQuestion.getFollowUpQuestions()) {
                fq.setQuestion(savedQuestion);  // Ensure question reference is set
                FollowUpQuestion savedFQ = followUpQuestionRepository.save(fq);
                logger.info("Saved follow-up question ID: {} for Question ID: {}: {}",
                    savedFQ.getId(), savedQuestion.getId(), fq.getQuestionText().substring(0, Math.min(50, fq.getQuestionText().length())));
            }
            logger.info("Successfully saved {} follow-up questions for '{}'", savedQuestion.getFollowUpQuestions().size(), title);
        } else {
            logger.warn("No follow-up questions found to save for '{}' (null or empty list)", title);
        }

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

    /**
     * Get text value from node, trying both camelCase and snake_case field names
     */
    private String getTextOrNull(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            if (node.has(fieldName) && !node.get(fieldName).isNull()) {
                JsonNode value = node.get(fieldName);
                if (value.isObject()) {
                    // If it's a JSON object, convert to string
                    return value.toString();
                }
                return value.asText();
            }
        }
        return null;
    }

    /**
     * Get integer value from node, trying both camelCase and snake_case field names
     */
    private Integer getIntOrNull(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            if (node.has(fieldName) && !node.get(fieldName).isNull()) {
                return node.get(fieldName).asInt();
            }
        }
        return null;
    }

    /**
     * Get long value from node, trying both camelCase and snake_case field names
     */
    private Long getLongOrNull(JsonNode node, String... fieldNames) {
        for (String fieldName : fieldNames) {
            if (node.has(fieldName) && !node.get(fieldName).isNull()) {
                return node.get(fieldName).asLong();
            }
        }
        return null;
    }
}
