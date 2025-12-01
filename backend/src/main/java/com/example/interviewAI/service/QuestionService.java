package com.example.interviewAI.service;

import com.example.interviewAI.dto.QuestionResponse;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.QuestionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        response.setCreatedAt(question.getCreatedAt());
        return response;
    }
}
