package com.example.interviewAI.controller;

import com.example.interviewAI.dto.QuestionResponse;
import com.example.interviewAI.service.QuestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/questions")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    /**
     * Get all questions
     */
    @GetMapping
    public ResponseEntity<?> getAllQuestions() {
        try {
            List<QuestionResponse> questions = questionService.getAllQuestions();
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("Error fetching questions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch questions"));
        }
    }

    /**
     * Get a specific question by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable Long id) {
        try {
            QuestionResponse question = questionService.getQuestionById(id);
            return ResponseEntity.ok(question);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching question: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch question"));
        }
    }

    /**
     * Get questions filtered by difficulty level
     */
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<?> getQuestionsByDifficulty(@PathVariable String difficulty) {
        try {
            List<QuestionResponse> questions = questionService.getQuestionsByDifficulty(difficulty);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("Error fetching questions by difficulty: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch questions by difficulty"));
        }
    }

    /**
     * Get questions filtered by supported language
     */
    @GetMapping("/language/{language}")
    public ResponseEntity<?> getQuestionsByLanguage(@PathVariable String language) {
        try {
            List<QuestionResponse> questions = questionService.getQuestionsByLanguage(language);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("Error fetching questions by language: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch questions by language"));
        }
    }

    /**
     * Get questions filtered by both difficulty and language
     */
    @GetMapping("/filter")
    public ResponseEntity<?> getQuestionsByDifficultyAndLanguage(
            @RequestParam String difficulty,
            @RequestParam String language) {
        try {
            List<QuestionResponse> questions = questionService.getQuestionsByDifficultyAndLanguage(difficulty, language);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            log.error("Error fetching questions by difficulty and language: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch questions by difficulty and language"));
        }
    }

    /**
     * Helper method to create error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }
}
