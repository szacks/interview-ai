package com.example.interviewAI.util;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.FollowUpQuestion;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.repository.QuestionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Utility class to export questions to JSON backup files.
 *
 * Usage:
 * 1. Run with: mvn spring-boot:run -Dspring-boot.run.arguments="--export-questions"
 * 2. Or use exportQuestion() / exportAllQuestions() methods programmatically
 *
 * Files will be saved to: src/main/resources/question-backups/
 */
@Component
public class QuestionBackupExporter implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(QuestionBackupExporter.class);
    private static final String BACKUP_DIR = "src/main/resources/question-backups";

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // Only run if --export-questions flag is present
        for (String arg : args) {
            if ("--export-questions".equals(arg)) {
                logger.info("Starting question backup export...");
                exportAllQuestions();
                break;
            } else if (arg.startsWith("--export-question=")) {
                String title = arg.substring("--export-question=".length());
                logger.info("Exporting question: {}", title);
                exportQuestionByTitle(title);
                break;
            }
        }
    }

    /**
     * Export all questions to individual JSON backup files
     */
    public void exportAllQuestions() throws IOException {
        // Create backup directory if it doesn't exist
        Path backupPath = Paths.get(BACKUP_DIR);
        if (!Files.exists(backupPath)) {
            Files.createDirectories(backupPath);
        }

        List<Question> questions = questionRepository.findAll();
        logger.info("Found {} questions to export", questions.size());

        int exported = 0;
        int failed = 0;

        for (Question question : questions) {
            try {
                exportQuestion(question);
                exported++;
            } catch (Exception e) {
                logger.error("Failed to export question '{}': {}", question.getTitle(), e.getMessage());
                failed++;
            }
        }

        logger.info("Export complete: {} exported, {} failed", exported, failed);
    }

    /**
     * Export a single question to a JSON backup file
     *
     * @param question The question entity to export
     */
    public void exportQuestion(Question question) throws IOException {
        // Create JSON structure
        ObjectNode root = objectMapper.createObjectNode();

        // Question object
        ObjectNode questionNode = objectMapper.createObjectNode();

        // Basic fields
        putIfNotNull(questionNode, "companyId", question.getCompanyId());
        putIfNotNull(questionNode, "createdBy", question.getCreatedBy());
        questionNode.put("title", question.getTitle());
        questionNode.put("description", question.getDescription());
        putIfNotNull(questionNode, "shortDescription", question.getShortDescription());
        putIfNotNull(questionNode, "category", question.getCategory());
        questionNode.put("difficulty", question.getDifficulty());

        // Time and language settings
        putIfNotNull(questionNode, "timeLimitMinutes", question.getTimeLimitMinutes());
        putIfNotNull(questionNode, "primaryLanguage", question.getPrimaryLanguage());
        putIfNotNull(questionNode, "supportedLanguages", question.getSupportedLanguages());

        // Code templates
        putIfNotNull(questionNode, "initialCodeJava", question.getInitialCodeJava());
        putIfNotNull(questionNode, "initialCodePython", question.getInitialCodePython());
        putIfNotNull(questionNode, "initialCodeJavascript", question.getInitialCodeJavascript());

        // JSON fields (stored as strings in the database)
        putIfNotNull(questionNode, "testsJson", question.getTestsJson());
        putIfNotNull(questionNode, "requirementsJson", question.getRequirementsJson());
        putIfNotNull(questionNode, "rubricJson", question.getRubricJson());
        putIfNotNull(questionNode, "intentionalBugsJson", question.getIntentionalBugsJson());
        // Note: followupQuestionsJson is deprecated - follow-up questions are now exported from the entity relationship
        putIfNotNull(questionNode, "generatedLanguagesJson", question.getGeneratedLanguagesJson());

        // AI configuration
        putIfNotNull(questionNode, "aiPromptTemplate", question.getAiPromptTemplate());
        putIfNotNull(questionNode, "aiCustomPrompt", question.getAiCustomPrompt());
        putIfNotNull(questionNode, "aiHelperName", question.getAiHelperName());
        if (question.getAgentTemplate() != null) {
            questionNode.put("agentTemplateId", question.getAgentTemplate().getId());
        }

        // Status and versioning
        questionNode.put("status", question.getStatus());
        questionNode.put("version", question.getVersion());
        putIfNotNull(questionNode, "parentQuestionId", question.getParentQuestionId());
        questionNode.put("currentStep", question.getCurrentStep());

        // Analytics
        questionNode.put("usageCount", question.getUsageCount());
        putIfNotNull(questionNode, "averageScore", question.getAverageScore());
        questionNode.put("deactivated", question.getDeactivated());

        root.set("question", questionNode);

        // Follow-up questions array
        if (question.getFollowUpQuestions() != null && !question.getFollowUpQuestions().isEmpty()) {
            ArrayNode followUpArray = objectMapper.createArrayNode();
            for (FollowUpQuestion fq : question.getFollowUpQuestions()) {
                ObjectNode fqNode = objectMapper.createObjectNode();
                fqNode.put("questionText", fq.getQuestionText());
                putIfNotNull(fqNode, "answer", fq.getAnswer());
                fqNode.put("orderIndex", fq.getOrderIndex());
                followUpArray.add(fqNode);
            }
            root.set("followUpQuestions", followUpArray);
        }

        // Test cases array
        if (question.getTestCases() != null && !question.getTestCases().isEmpty()) {
            ArrayNode testCaseArray = objectMapper.createArrayNode();
            for (TestCase tc : question.getTestCases()) {
                ObjectNode tcNode = objectMapper.createObjectNode();
                tcNode.put("testName", tc.getTestName());
                putIfNotNull(tcNode, "testCase", tc.getTestCase());
                putIfNotNull(tcNode, "description", tc.getDescription());
                putIfNotNull(tcNode, "operationsJson", tc.getOperationsJson());
                putIfNotNull(tcNode, "assertionsJson", tc.getAssertionsJson());
                tcNode.put("orderIndex", tc.getOrderIndex());
                tcNode.put("passed", tc.getPassed());
                testCaseArray.add(tcNode);
            }
            root.set("testCases", testCaseArray);
        }

        // Generate filename from title
        String filename = generateFilename(question.getTitle());
        File file = new File(BACKUP_DIR, filename);

        // Write to file with pretty printing
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        objectMapper.writeValue(file, root);

        logger.info("Exported question '{}' to {}", question.getTitle(), filename);
    }

    /**
     * Export a question by its title
     */
    public void exportQuestionByTitle(String title) throws IOException {
        List<Question> questions = questionRepository.findByTitle(title);
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("Question not found: " + title);
        }

        // Export the first matching question
        exportQuestion(questions.get(0));
    }

    /**
     * Export a question by its ID
     */
    public void exportQuestionById(Long id) throws IOException {
        Question question = questionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Question not found with ID: " + id));

        exportQuestion(question);
    }

    // Helper methods

    private void putIfNotNull(ObjectNode node, String key, Object value) {
        if (value != null) {
            if (value instanceof String) {
                node.put(key, (String) value);
            } else if (value instanceof Integer) {
                node.put(key, (Integer) value);
            } else if (value instanceof Long) {
                node.put(key, (Long) value);
            } else if (value instanceof Boolean) {
                node.put(key, (Boolean) value);
            } else if (value instanceof java.math.BigDecimal) {
                node.put(key, (java.math.BigDecimal) value);
            }
        } else {
            node.putNull(key);
        }
    }

    private String generateFilename(String title) {
        // Convert title to kebab-case filename
        String kebabCase = title.toLowerCase()
                               .trim()
                               .replaceAll("\\s+", "-")
                               .replaceAll("[^a-z0-9-]", "");

        return "question-" + kebabCase + ".json";
    }
}
