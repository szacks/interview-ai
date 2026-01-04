package com.example.interviewAI.service;

import com.example.interviewAI.dto.QuestionResponse;
import com.example.interviewAI.dto.FollowUpQuestionResponse;
import com.example.interviewAI.dto.TestCaseResponse;
import com.example.interviewAI.dto.CreateQuestionRequest;
import com.example.interviewAI.dto.UpdateQuestionRequest;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.FollowUpQuestion;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.repository.QuestionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Get all questions
     */
    public List<QuestionResponse> getAllQuestions() {
        List<Question> questions = questionRepository.findAll();
        return questions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a question by ID
     */
    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));
        return convertToResponse(question);
    }

    /**
     * Get questions by difficulty level
     */
    public List<QuestionResponse> getQuestionsByDifficulty(String difficulty) {
        List<Question> questions = questionRepository.findByDifficulty(difficulty);
        return questions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get questions by supported language
     */
    public List<QuestionResponse> getQuestionsByLanguage(String language) {
        List<Question> questions = questionRepository.findByLanguage(language);
        return questions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get questions by difficulty and language
     */
    public List<QuestionResponse> getQuestionsByDifficultyAndLanguage(String difficulty, String language) {
        List<Question> questions = questionRepository.findByDifficultyAndLanguage(difficulty, language);
        return questions.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Question entity to QuestionResponse DTO
     */
    private QuestionResponse convertToResponse(Question question) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setTitle(question.getTitle());
        response.setShortDescription(question.getShortDescription());
        response.setDescription(question.getDescription());
        response.setDifficulty(question.getDifficulty());
        response.setTimeLimitMinutes(question.getTimeLimitMinutes());
        response.setSupportedLanguages(question.getSupportedLanguages());
        response.setRequirementsJson(question.getRequirementsJson());
        response.setTestsJson(question.getTestsJson());
        response.setRubricJson(question.getRubricJson());
        response.setIntentionalBugsJson(question.getIntentionalBugsJson());
        response.setInitialCodeJava(question.getInitialCodeJava());
        response.setInitialCodePython(question.getInitialCodePython());
        response.setInitialCodeJavascript(question.getInitialCodeJavascript());
        response.setAiPromptTemplate(question.getAiPromptTemplate());
        response.setAiCustomPrompt(question.getAiCustomPrompt());
        response.setAiHelperName(question.getAiHelperName());
        response.setPrimaryLanguage(question.getPrimaryLanguage());
        response.setGeneratedLanguagesJson(question.getGeneratedLanguagesJson());
        response.setFollowupQuestionsJson(question.getFollowupQuestionsJson());
        response.setStatus(question.getStatus());
        response.setCurrentStep(question.getCurrentStep());
        response.setCategory(question.getCategory());
        response.setCreatedAt(question.getCreatedAt());

        // Map follow-up questions
        if (question.getFollowUpQuestions() != null && !question.getFollowUpQuestions().isEmpty()) {
            log.info("[Question {}] Converting {} follow-up questions", question.getId(), question.getFollowUpQuestions().size());
            response.setFollowUpQuestions(
                    question.getFollowUpQuestions().stream()
                            .map(this::convertFollowUpQuestionToResponse)
                            .collect(Collectors.toList())
            );
        } else {
            log.info("[Question {}] No follow-up questions found (followUpQuestions = {})", question.getId(), question.getFollowUpQuestions());
        }

        // Map test cases
        if (question.getTestCases() != null && !question.getTestCases().isEmpty()) {
            response.setTestCases(
                    question.getTestCases().stream()
                            .map(this::convertTestCaseToResponse)
                            .collect(Collectors.toList())
            );
        }

        return response;
    }

    /**
     * Convert FollowUpQuestion entity to FollowUpQuestionResponse DTO
     */
    private FollowUpQuestionResponse convertFollowUpQuestionToResponse(FollowUpQuestion followUpQuestion) {
        FollowUpQuestionResponse response = new FollowUpQuestionResponse();
        response.setId(followUpQuestion.getId());
        response.setQuestion(followUpQuestion.getQuestionText());
        response.setAnswer(followUpQuestion.getAnswer());
        response.setOrderIndex(followUpQuestion.getOrderIndex());
        return response;
    }

    /**
     * Convert TestCase entity to TestCaseResponse DTO
     */
    private TestCaseResponse convertTestCaseToResponse(TestCase testCase) {
        TestCaseResponse response = new TestCaseResponse();
        response.setId(testCase.getId());
        response.setTestName(testCase.getTestName());
        response.setTestCase(testCase.getTestCase());
        response.setDescription(testCase.getDescription());
        response.setOperationsJson(testCase.getOperationsJson());
        response.setAssertionsJson(testCase.getAssertionsJson());
        response.setOrderIndex(testCase.getOrderIndex());
        response.setPassed(testCase.getPassed());
        return response;
    }

    // ========== Create Question ==========
    /**
     * Create a new question from the question builder
     */
    public QuestionResponse createQuestion(CreateQuestionRequest request, Long userId) {
        log.info("Creating new question: {}", request.getTitle());

        Question question = new Question();
        question.setTitle(request.getTitle());
        question.setCategory(request.getCategory());
        question.setDifficulty(request.getDifficulty());
        question.setShortDescription(request.getShortDescription());
        question.setDescription(request.getDescription());
        question.setPrimaryLanguage(request.getPrimaryLanguage());
        question.setInitialCodeJava(request.getInitialCodeJava());
        question.setInitialCodePython(request.getInitialCodePython());
        question.setInitialCodeJavascript(request.getInitialCodeJavascript());
        question.setTestsJson(request.getTestsJson());
        question.setAiPromptTemplate(request.getAiPromptTemplate() != null ? request.getAiPromptTemplate() : "helpful");
        question.setAiCustomPrompt(request.getAiCustomPrompt());
        question.setAiHelperName(request.getAiHelperName());
        question.setFollowupQuestionsJson(request.getFollowupQuestionsJson());
        question.setStatus(request.getStatus());
        question.setCreatedBy(userId);
        question.setCompanyId(request.getCompanyId());
        question.setCreatedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());

        // Set current step for draft progress tracking
        if (request.getCurrentStep() != null) {
            question.setCurrentStep(request.getCurrentStep());
        }

        // Set generated languages tracking
        if (request.getGeneratedLanguages() != null) {
            question.setGeneratedLanguagesJson(convertMapToJson(request.getGeneratedLanguages()));
        }

        // Set published timestamp if publishing
        if ("PUBLISHED".equals(request.getStatus())) {
            question.setPublishedAt(LocalDateTime.now());
        }

        Question saved = questionRepository.save(question);
        log.info("Question created successfully with id: {}", saved.getId());

        return convertToResponse(saved);
    }

    // ========== Update Question ==========
    /**
     * Update an existing question
     */
    public QuestionResponse updateQuestion(Long id, UpdateQuestionRequest request, Long userId) {
        log.info("Updating question with id: {}", id);

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        // Update all provided fields
        if (request.getTitle() != null) {
            question.setTitle(request.getTitle());
        }
        if (request.getCategory() != null) {
            question.setCategory(request.getCategory());
        }
        if (request.getDifficulty() != null) {
            question.setDifficulty(request.getDifficulty());
        }
        if (request.getShortDescription() != null) {
            question.setShortDescription(request.getShortDescription());
        }
        if (request.getDescription() != null) {
            question.setDescription(request.getDescription());
        }
        if (request.getPrimaryLanguage() != null) {
            question.setPrimaryLanguage(request.getPrimaryLanguage());
        }
        if (request.getInitialCodeJava() != null) {
            question.setInitialCodeJava(request.getInitialCodeJava());
        }
        if (request.getInitialCodePython() != null) {
            question.setInitialCodePython(request.getInitialCodePython());
        }
        if (request.getInitialCodeJavascript() != null) {
            question.setInitialCodeJavascript(request.getInitialCodeJavascript());
        }
        if (request.getTestsJson() != null) {
            question.setTestsJson(request.getTestsJson());
        }
        if (request.getAiPromptTemplate() != null) {
            question.setAiPromptTemplate(request.getAiPromptTemplate());
        }
        if (request.getAiCustomPrompt() != null) {
            question.setAiCustomPrompt(request.getAiCustomPrompt());
        }
        if (request.getAiHelperName() != null) {
            question.setAiHelperName(request.getAiHelperName());
        }
        if (request.getFollowupQuestionsJson() != null) {
            question.setFollowupQuestionsJson(request.getFollowupQuestionsJson());
        }
        if (request.getStatus() != null) {
            question.setStatus(request.getStatus());
            // Set published timestamp when publishing
            if ("PUBLISHED".equals(request.getStatus()) && question.getPublishedAt() == null) {
                question.setPublishedAt(LocalDateTime.now());
            }
        }
        if (request.getCompanyId() != null) {
            question.setCompanyId(request.getCompanyId());
        }
        if (request.getGeneratedLanguages() != null) {
            question.setGeneratedLanguagesJson(convertMapToJson(request.getGeneratedLanguages()));
        }
        if (request.getCurrentStep() != null) {
            question.setCurrentStep(request.getCurrentStep());
        }

        // Increment version on update
        if (question.getVersion() == null) {
            question.setVersion(1);
        } else {
            question.setVersion(question.getVersion() + 1);
        }

        question.setUpdatedAt(LocalDateTime.now());

        Question updated = questionRepository.save(question);
        log.info("Question updated successfully with id: {}", updated.getId());

        return convertToResponse(updated);
    }

    // ========== Delete Question ==========
    /**
     * Soft delete a question by marking it as archived
     */
    public void deleteQuestion(Long id) {
        log.info("Archiving question with id: {}", id);

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Question not found with id: " + id));

        question.setStatus("ARCHIVED");
        question.setArchivedAt(LocalDateTime.now());
        question.setUpdatedAt(LocalDateTime.now());

        questionRepository.save(question);
        log.info("Question archived successfully with id: {}", id);
    }

    // ========== Helper Methods ==========
    /**
     * Convert Map to JSON string representation
     */
    private String convertMapToJson(java.util.Map<String, java.util.Map<String, Boolean>> map) {
        if (map == null) {
            return null;
        }
        try {
            // Simple JSON conversion - in production, use Jackson ObjectMapper
            StringBuilder json = new StringBuilder("{");
            map.forEach((key, value) -> {
                json.append("\"").append(key).append("\":{");
                value.forEach((k, v) -> {
                    json.append("\"").append(k).append("\":").append(v).append(",");
                });
                json.deleteCharAt(json.length() - 1); // Remove last comma
                json.append("},");
            });
            json.deleteCharAt(json.length() - 1); // Remove last comma
            json.append("}");
            return json.toString();
        } catch (Exception e) {
            log.error("Error converting map to JSON", e);
            return null;
        }
    }
}
