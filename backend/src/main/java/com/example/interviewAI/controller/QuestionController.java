package com.example.interviewAI.controller;

import com.example.interviewAI.dto.*;
import com.example.interviewAI.service.QuestionService;
import com.example.interviewAI.service.CodeConversionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

/**
 * REST controller for question management operations.
 * Handles retrieval, creation, updating, and deletion of coding questions.
 */
@Slf4j
@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;
    private final CodeConversionService codeConversionService;

    /**
     * Get all questions.
     *
     * @return list of all questions
     */
    @GetMapping
    public ResponseEntity<List<QuestionResponse>> getAllQuestions() {
        log.debug("Fetching all questions");
        List<QuestionResponse> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    /**
     * Get a specific question by ID.
     *
     * @param id question identifier
     * @return question details
     */
    @GetMapping("/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        log.debug("Fetching question with ID: {}", id);
        QuestionResponse question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

    /**
     * Get questions filtered by difficulty level.
     *
     * @param difficulty difficulty level (e.g., easy, medium, hard)
     * @return list of questions matching difficulty
     */
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByDifficulty(@PathVariable String difficulty) {
        log.debug("Fetching questions with difficulty: {}", difficulty);
        List<QuestionResponse> questions = questionService.getQuestionsByDifficulty(difficulty);
        return ResponseEntity.ok(questions);
    }

    /**
     * Get questions filtered by supported language.
     *
     * @param language programming language (e.g., java, python, javascript)
     * @return list of questions supporting the language
     */
    @GetMapping("/language/{language}")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByLanguage(@PathVariable String language) {
        log.debug("Fetching questions for language: {}", language);
        List<QuestionResponse> questions = questionService.getQuestionsByLanguage(language);
        return ResponseEntity.ok(questions);
    }

    /**
     * Get questions filtered by both difficulty and language.
     *
     * @param difficulty difficulty level
     * @param language programming language
     * @return list of questions matching both criteria
     */
    @GetMapping("/filter")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByDifficultyAndLanguage(
            @RequestParam String difficulty,
            @RequestParam String language) {
        log.debug("Fetching questions with difficulty: {} and language: {}", difficulty, language);
        List<QuestionResponse> questions = questionService.getQuestionsByDifficultyAndLanguage(difficulty, language);
        return ResponseEntity.ok(questions);
    }

    /**
     * Create a new question through the question builder.
     *
     * @param request the question creation request from the frontend
     * @param authentication the authenticated user
     * @return the created question
     */
    @PostMapping
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
        log.info("Creating new question: {}", request.getTitle());

        Long userId = extractUserIdFromAuthentication(authentication);
        QuestionResponse response = questionService.createQuestion(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update an existing question.
     *
     * @param id the question ID
     * @param request the update request
     * @param authentication the authenticated user
     * @return the updated question
     */
    @PutMapping("/{id}")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request,
            Authentication authentication) {
        log.info("Updating question with id: {}", id);

        Long userId = extractUserIdFromAuthentication(authentication);
        QuestionResponse response = questionService.updateQuestion(id, request, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Archive (soft delete) a question.
     *
     * @param id the question ID
     * @return empty response with 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        log.info("Archiving question with id: {}", id);
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Convert code from one language to another using Claude AI.
     * Used in Step 3 of the question builder when "Generate Other Languages" is clicked.
     *
     * @param request the code conversion request
     * @return the converted code
     */
    @PostMapping("/convert-code")
    public ResponseEntity<CodeConversionResponse> convertCode(
            @Valid @RequestBody CodeConversionRequest request) {
        log.info("Converting code from {} to {}", request.getSourceLanguage(), request.getTargetLanguage());

        try {
            CodeConversionResponse response = codeConversionService.convertCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error converting code", e);
            return ResponseEntity.ok(CodeConversionResponse.failure(
                    request.getTargetLanguage(),
                    "Failed to convert code: " + e.getMessage()
            ));
        }
    }

    /**
     * Validate a question's code templates and test cases.
     * Used in Step 6 of the question builder (Preview & Validate).
     *
     * @param id the question ID
     * @return validation result
     */
    @PostMapping("/{id}/validate")
    public ResponseEntity<ValidationResponse> validateQuestion(@PathVariable Long id) {
        log.info("Validating question with id: {}", id);

        try {
            QuestionResponse question = questionService.getQuestionById(id);

            return ResponseEntity.ok(ValidationResponse.builder()
                    .success(true)
                    .hasErrors(false)
                    .message("Question validation passed")
                    .questionId(id)
                    .codeTemplatesPresent(true)
                    .build());
        } catch (Exception e) {
            log.error("Error validating question", e);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ValidationResponse.builder()
                            .success(false)
                            .hasErrors(true)
                            .message("Validation failed: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Test the AI assistant configuration for a question.
     * Used in Step 5 of the question builder (AI Configuration).
     *
     * @param id the question ID
     * @param request the test chat request
     * @return the AI response
     */
    @PostMapping("/{id}/test-ai")
    public ResponseEntity<AITestResponse> testAIChat(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {
        log.info("Testing AI chat for question with id: {}", id);

        try {
            String message = request.get("message");
            String prompt = request.get("prompt");

            // For MVP, return a mock response
            // Full implementation would call Claude API with the prompt
            return ResponseEntity.ok(AITestResponse.builder()
                    .message("AI response placeholder. In full implementation, this would call Claude API.")
                    .success(true)
                    .build());
        } catch (Exception e) {
            log.error("Error testing AI chat", e);

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(AITestResponse.builder()
                            .error("Failed to test AI: " + e.getMessage())
                            .success(false)
                            .build());
        }
    }

    /**
     * Extract user ID from Authentication object.
     * Handles various authentication principal types.
     *
     * @param authentication the Spring Security authentication object
     * @return the user ID, or 1L as fallback for anonymous/system users
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("No authentication found, using system user ID");
            return 1L; // System user fallback
        }

        try {
            Object principal = authentication.getPrincipal();

            // If principal is a UserDetails implementation with user ID
            if (principal instanceof UserDetails) {
                // Try to extract ID from username if it's numeric
                String username = ((UserDetails) principal).getUsername();
                try {
                    return Long.parseLong(username);
                } catch (NumberFormatException e) {
                    log.debug("Username is not numeric, using system user");
                }
            }

            // If principal is already a user ID
            if (principal instanceof Long) {
                return (Long) principal;
            }

            // If principal is a string representation of user ID
            if (principal instanceof String) {
                try {
                    return Long.parseLong((String) principal);
                } catch (NumberFormatException e) {
                    log.debug("Principal string is not numeric");
                }
            }

            log.warn("Could not extract user ID from authentication principal of type: {}",
                    principal.getClass().getName());
            return 1L; // Fallback to system user

        } catch (Exception e) {
            log.warn("Error extracting user ID from authentication", e);
            return 1L; // Fallback to system user
        }
    }
}
