package com.example.interviewAI.service;

import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AccessTokenValidator service.
 *
 * These tests verify:
 * - Token validation against database
 * - Exception handling for invalid tokens
 * - Interview accessibility checks
 * - Token format validation
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AccessTokenValidator Tests")
public class AccessTokenValidatorTest {

    @Mock
    private InterviewRepository interviewRepository;

    @InjectMocks
    private AccessTokenValidator tokenValidator;

    private AccessTokenGenerator tokenGenerator;

    private Interview mockInterview;
    private String validToken;

    @BeforeEach
    void setUp() {
        // Initialize AccessTokenGenerator for testing
        tokenGenerator = new AccessTokenGenerator();
        assertNotNull(tokenValidator, "AccessTokenValidator should be injected");
        assertNotNull(tokenGenerator, "AccessTokenGenerator should be initialized");

        // Create a mock interview
        mockInterview = new Interview();
        mockInterview.setId(1L);
        mockInterview.setStatus("scheduled");
        mockInterview.setLanguage("java");

        // Generate a valid token for testing
        validToken = tokenGenerator.generateAccessToken();
        mockInterview.setInterviewLinkToken(validToken);
    }

    @Test
    @DisplayName("Should retrieve interview by valid access token")
    void testGetInterviewByAccessToken_ValidToken() {
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        Interview result = tokenValidator.getInterviewByAccessToken(validToken);

        assertNotNull(result, "Should return interview for valid token");
        assertEquals(mockInterview.getId(), result.getId(), "Should return correct interview");
    }

    @Test
    @DisplayName("Should throw exception for invalid token format")
    void testGetInterviewByAccessToken_InvalidFormat() {
        String invalidToken = "invalid-token!@#";

        assertThrows(UnauthorizedException.class, () ->
            tokenValidator.getInterviewByAccessToken(invalidToken),
            "Should throw UnauthorizedException for invalid token format"
        );
    }

    @Test
    @DisplayName("Should throw exception for non-existent token")
    void testGetInterviewByAccessToken_TokenNotFound() {
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
            tokenValidator.getInterviewByAccessToken(validToken),
            "Should throw ResourceNotFoundException when token not found"
        );
    }

    @Test
    @DisplayName("Should validate existing access token")
    void testIsAccessTokenValid_ValidToken() {
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        boolean result = tokenValidator.isAccessTokenValid(validToken);

        assertTrue(result, "Valid token should return true");
    }

    @Test
    @DisplayName("Should reject invalid format token")
    void testIsAccessTokenValid_InvalidFormat() {
        boolean result = tokenValidator.isAccessTokenValid("invalid!@#");

        assertFalse(result, "Invalid format token should return false");
    }

    @Test
    @DisplayName("Should reject non-existent token")
    void testIsAccessTokenValid_TokenNotFound() {
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.empty());

        boolean result = tokenValidator.isAccessTokenValid(validToken);

        assertFalse(result, "Non-existent token should return false");
    }

    @Test
    @DisplayName("Should reject null token")
    void testIsAccessTokenValid_NullToken() {
        boolean result = tokenValidator.isAccessTokenValid(null);

        assertFalse(result, "Null token should return false");
    }

    @Test
    @DisplayName("Should check if interview is accessible")
    void testIsInterviewAccessible_ValidToken() {
        mockInterview.setStatus("scheduled");
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        boolean result = tokenValidator.isInterviewAccessible(validToken);

        assertTrue(result, "Valid token with active interview should be accessible");
    }

    @Test
    @DisplayName("Should reject cancelled interview")
    void testIsInterviewAccessible_CancelledInterview() {
        mockInterview.setStatus("cancelled");
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        boolean result = tokenValidator.isInterviewAccessible(validToken);

        assertFalse(result, "Cancelled interview should not be accessible");
    }

    @Test
    @DisplayName("Should get accessible interview with valid token")
    void testGetAccessibleInterview_ValidToken() {
        mockInterview.setStatus("scheduled");
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        Interview result = tokenValidator.getAccessibleInterview(validToken);

        assertNotNull(result, "Should return accessible interview");
        assertEquals(mockInterview.getId(), result.getId());
    }

    @Test
    @DisplayName("Should throw exception for inaccessible interview")
    void testGetAccessibleInterview_InaccessibleInterview() {
        mockInterview.setStatus("cancelled");
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        assertThrows(UnauthorizedException.class, () ->
            tokenValidator.getAccessibleInterview(validToken),
            "Should throw exception for inaccessible interview"
        );
    }

    @Test
    @DisplayName("Should validate token for specific interview")
    void testValidateTokenForInterview_MatchingToken() {
        when(interviewRepository.findByIdAndInterviewLinkToken(1L, validToken))
            .thenReturn(Optional.of(mockInterview));

        boolean result = tokenValidator.validateTokenForInterview(1L, validToken);

        assertTrue(result, "Matching token should be valid");
    }

    @Test
    @DisplayName("Should reject token for different interview")
    void testValidateTokenForInterview_MismatchingToken() {
        when(interviewRepository.findByIdAndInterviewLinkToken(2L, validToken))
            .thenReturn(Optional.empty());

        boolean result = tokenValidator.validateTokenForInterview(2L, validToken);

        assertFalse(result, "Token for different interview should be invalid");
    }

    @Test
    @DisplayName("Should handle exceptions gracefully")
    void testValidateTokenForInterview_Exception() {
        when(interviewRepository.findByIdAndInterviewLinkToken(1L, validToken))
            .thenThrow(new RuntimeException("Database error"));

        boolean result = tokenValidator.validateTokenForInterview(1L, validToken);

        assertFalse(result, "Should return false on exception");
    }

    @Test
    @DisplayName("Should accept interview with various statuses")
    void testIsInterviewAccessible_VariousStatuses() {
        String[] accessibleStatuses = {"scheduled", "in_progress", "completed"};

        for (String status : accessibleStatuses) {
            mockInterview.setStatus(status);
            when(interviewRepository.findByInterviewLinkToken(validToken))
                .thenReturn(Optional.of(mockInterview));

            boolean result = tokenValidator.isInterviewAccessible(validToken);

            assertTrue(result, "Interview with status '" + status + "' should be accessible");
        }
    }

    @Test
    @DisplayName("Should provide validation info")
    void testGetValidationInfo() {
        String info = tokenValidator.getValidationInfo();

        assertNotNull(info, "Validation info should not be null");
        assertTrue(info.contains("Token Validator"), "Info should mention validator");
        assertTrue(info.contains("validates token format"), "Info should describe validation");
    }

    @Test
    @DisplayName("Should handle multiple sequential validations")
    void testMultipleValidations_Sequential() {
        when(interviewRepository.findByInterviewLinkToken(validToken))
            .thenReturn(Optional.of(mockInterview));

        // Multiple calls should work consistently
        assertTrue(tokenValidator.isAccessTokenValid(validToken));
        assertTrue(tokenValidator.isAccessTokenValid(validToken));
        assertTrue(tokenValidator.isAccessTokenValid(validToken));
    }

    @Test
    @DisplayName("Should differentiate between different tokens")
    void testMultipleTokens_Differentiation() {
        String token1 = tokenGenerator.generateAccessToken();
        String token2 = tokenGenerator.generateAccessToken();

        Interview interview1 = new Interview();
        interview1.setId(1L);
        interview1.setStatus("scheduled");
        interview1.setInterviewLinkToken(token1);

        Interview interview2 = new Interview();
        interview2.setId(2L);
        interview2.setStatus("in_progress");
        interview2.setInterviewLinkToken(token2);

        when(interviewRepository.findByInterviewLinkToken(token1))
            .thenReturn(Optional.of(interview1));
        when(interviewRepository.findByInterviewLinkToken(token2))
            .thenReturn(Optional.of(interview2));

        Interview result1 = tokenValidator.getInterviewByAccessToken(token1);
        Interview result2 = tokenValidator.getInterviewByAccessToken(token2);

        assertEquals(1L, result1.getId(), "Token1 should resolve to interview1");
        assertEquals(2L, result2.getId(), "Token2 should resolve to interview2");
    }
}
