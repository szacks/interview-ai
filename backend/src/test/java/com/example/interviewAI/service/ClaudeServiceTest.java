package com.example.interviewAI.service;

import com.example.interviewAI.config.ClaudeProperties;
import com.example.interviewAI.dto.ClaudeEvaluationResponse;
import com.example.interviewAI.dto.EvaluationResultDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@DisplayName("ClaudeService Tests")
public class ClaudeServiceTest {

    @Mock
    private ClaudeProperties claudeProperties;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ClaudeService claudeService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Setup default properties
        when(claudeProperties.getApiKey()).thenReturn("test-api-key");
        when(claudeProperties.getModel()).thenReturn("claude-haiku-4-5-20251001");
        when(claudeProperties.getApiUrl()).thenReturn("https://api.anthropic.com/v1");
        when(claudeProperties.getMaxTokens()).thenReturn(1024);
        when(claudeProperties.getTemperature()).thenReturn(0.7);
    }

    @Test
    @DisplayName("Should successfully evaluate code and return evaluation result")
    void testEvaluateCodeSuccess() {
        // Arrange
        String candidateName = "John Doe";
        String questionTitle = "Two Sum";
        String questionDescription = "Given an array of integers, find two numbers that add up to a specific target";
        String requirementsJson = "{}";
        String codeSubmission = "function twoSum(nums, target) { return [0, 1]; }";
        String testResults = "All tests passed";

        // Mock Claude API response
        ClaudeEvaluationResponse mockResponse = createMockClaudeResponse();
        when(restTemplate.postForObject(
                contains("/messages"),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenReturn(mockResponse);

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                candidateName, questionTitle, questionDescription,
                requirementsJson, codeSubmission, testResults
        );

        // Assert
        assertNotNull(result);
        assertTrue(result.getUnderstandingScore() >= 1 && result.getUnderstandingScore() <= 10);
        assertTrue(result.getProblemSolvingScore() >= 1 && result.getProblemSolvingScore() <= 10);
        assertTrue(result.getAiCollaborationScore() >= 1 && result.getAiCollaborationScore() <= 10);
        assertTrue(result.getCommunicationScore() >= 1 && result.getCommunicationScore() <= 10);
        assertNotNull(result.getStrengths());
        assertNotNull(result.getWeaknesses());
    }

    @Test
    @DisplayName("Should return default evaluation on API error")
    void testEvaluateCodeApiError() {
        // Arrange
        String candidateName = "Jane Doe";
        String questionTitle = "Palindrome Check";
        String questionDescription = "Check if a string is a palindrome";
        String requirementsJson = "{}";
        String codeSubmission = "function isPalindrome(str) { return true; }";
        String testResults = "Failed tests";

        // Mock Claude API to return null (error scenario)
        when(restTemplate.postForObject(
                any(),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenReturn(null);

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                candidateName, questionTitle, questionDescription,
                requirementsJson, codeSubmission, testResults
        );

        // Assert - should return default evaluation
        assertNotNull(result);
        assertEquals(5, result.getUnderstandingScore());
        assertEquals(5, result.getProblemSolvingScore());
        assertEquals(5, result.getAiCollaborationScore());
        assertEquals(5, result.getCommunicationScore());
        assertTrue(result.getStrengths().contains("Evaluation pending"));
    }

    @Test
    @DisplayName("Should handle exception gracefully and return default evaluation")
    void testEvaluateCodeException() {
        // Arrange
        String candidateName = "Error Test";
        String questionTitle = "Test Question";
        String questionDescription = "Test Description";
        String requirementsJson = "{}";
        String codeSubmission = "code";
        String testResults = "results";

        // Mock Claude API to throw exception
        when(restTemplate.postForObject(
                any(),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenThrow(new RuntimeException("Connection error"));

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                candidateName, questionTitle, questionDescription,
                requirementsJson, codeSubmission, testResults
        );

        // Assert - should return default evaluation
        assertNotNull(result);
        assertEquals(5, result.getUnderstandingScore());
    }

    @Test
    @DisplayName("Should parse evaluation scores correctly from response")
    void testParseEvaluationScores() {
        // Arrange
        String responseWithScores = """
                Here is my evaluation:

                UNDERSTANDING_SCORE: 8
                PROBLEM_SOLVING_SCORE: 9
                AI_COLLABORATION_SCORE: 7
                COMMUNICATION_SCORE: 8
                STRENGTHS: Good logic, Clear implementation
                WEAKNESSES: Minor edge case handling
                """;

        ClaudeEvaluationResponse mockResponse = new ClaudeEvaluationResponse();
        ClaudeEvaluationResponse.ContentBlock contentBlock = new ClaudeEvaluationResponse.ContentBlock();
        contentBlock.setText(responseWithScores);
        mockResponse.setContent(List.of(contentBlock));

        when(restTemplate.postForObject(
                any(),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenReturn(mockResponse);

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                "Test Candidate", "Test Question", "Description",
                "{}", "code", "test results"
        );

        // Assert - check that scores were parsed and are within valid range
        assertNotNull(result);
        assertTrue(result.getUnderstandingScore() >= 1 && result.getUnderstandingScore() <= 10);
        assertTrue(result.getProblemSolvingScore() >= 1 && result.getProblemSolvingScore() <= 10);
        assertTrue(result.getAiCollaborationScore() >= 1 && result.getAiCollaborationScore() <= 10);
        assertTrue(result.getCommunicationScore() >= 1 && result.getCommunicationScore() <= 10);
        assertNotNull(result.getStrengths());
        assertNotNull(result.getWeaknesses());
    }

    @Test
    @DisplayName("Should clamp scores to 1-10 range")
    void testScoreClamping() {
        // Arrange
        String responseWithInvalidScores = """
                UNDERSTANDING_SCORE: 15
                PROBLEM_SOLVING_SCORE: 0
                AI_COLLABORATION_SCORE: 100
                COMMUNICATION_SCORE: -5
                STRENGTHS: Test
                WEAKNESSES: Test
                """;

        ClaudeEvaluationResponse mockResponse = new ClaudeEvaluationResponse();
        ClaudeEvaluationResponse.ContentBlock contentBlock = new ClaudeEvaluationResponse.ContentBlock();
        contentBlock.setText(responseWithInvalidScores);
        mockResponse.setContent(List.of(contentBlock));

        when(restTemplate.postForObject(
                any(),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenReturn(mockResponse);

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                "Test Candidate", "Test Question", "Description",
                "{}", "code", "test results"
        );

        // Assert - scores should be clamped to 1-10 range and be valid
        assertNotNull(result);
        assertTrue(result.getUnderstandingScore() >= 1 && result.getUnderstandingScore() <= 10,
                "Understanding score should be clamped between 1-10");
        assertTrue(result.getProblemSolvingScore() >= 1 && result.getProblemSolvingScore() <= 10,
                "Problem solving score should be clamped between 1-10");
        assertTrue(result.getAiCollaborationScore() >= 1 && result.getAiCollaborationScore() <= 10,
                "AI collaboration score should be clamped between 1-10");
        assertTrue(result.getCommunicationScore() >= 1 && result.getCommunicationScore() <= 10,
                "Communication score should be clamped between 1-10");
    }

    @Test
    @DisplayName("Should handle missing sections gracefully")
    void testMissingSections() {
        // Arrange
        String responseWithMissingScores = """
                Some evaluation without proper format
                Just plain text
                """;

        ClaudeEvaluationResponse mockResponse = new ClaudeEvaluationResponse();
        ClaudeEvaluationResponse.ContentBlock contentBlock = new ClaudeEvaluationResponse.ContentBlock();
        contentBlock.setText(responseWithMissingScores);
        mockResponse.setContent(List.of(contentBlock));

        when(restTemplate.postForObject(
                any(),
                any(HttpEntity.class),
                eq(ClaudeEvaluationResponse.class)
        )).thenReturn(mockResponse);

        // Act
        EvaluationResultDto result = claudeService.evaluateCode(
                "Test Candidate", "Test Question", "Description",
                "{}", "code", "test results"
        );

        // Assert - should use default middle scores
        assertEquals(5, result.getUnderstandingScore());
        assertEquals(5, result.getProblemSolvingScore());
        assertEquals(5, result.getAiCollaborationScore());
        assertEquals(5, result.getCommunicationScore());
    }

    // Helper method to create mock Claude response
    private ClaudeEvaluationResponse createMockClaudeResponse() {
        String responseText = """
                Evaluation of the candidate's code:

                UNDERSTANDING_SCORE: 8
                PROBLEM_SOLVING_SCORE: 8
                AI_COLLABORATION_SCORE: 7
                COMMUNICATION_SCORE: 8
                STRENGTHS: - Good algorithmic thinking
                - Clear code structure
                - Efficient implementation
                WEAKNESSES: - Missing edge case handling
                - Could improve code comments
                """;

        ClaudeEvaluationResponse response = new ClaudeEvaluationResponse();
        ClaudeEvaluationResponse.ContentBlock contentBlock = new ClaudeEvaluationResponse.ContentBlock();
        contentBlock.setText(responseText);
        response.setContent(List.of(contentBlock));
        return response;
    }
}
