package com.example.interviewAI.controller;

import com.example.interviewAI.dto.QuestionResponse;
import com.example.interviewAI.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for question management operations.
 * Handles retrieval and filtering of coding questions.
 */
@Slf4j
@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

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
}
