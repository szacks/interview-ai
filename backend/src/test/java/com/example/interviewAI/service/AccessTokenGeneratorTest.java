package com.example.interviewAI.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for AccessTokenGenerator service.
 *
 * These tests verify:
 * - Token generation produces valid format tokens
 * - Generated tokens are unique
 * - Token length is correct
 * - Token validation works correctly
 * - Entropy calculations are accurate
 */
@SpringBootTest
@DisplayName("AccessTokenGenerator Tests")
public class AccessTokenGeneratorTest {

    @Autowired
    private AccessTokenGenerator tokenGenerator;

    private static final int DEFAULT_TOKEN_LENGTH = 12;
    private static final String ALPHANUMERIC_PATTERN = "^[a-zA-Z0-9]+$";

    @BeforeEach
    void setUp() {
        assertNotNull(tokenGenerator, "AccessTokenGenerator should be autowired");
    }

    @Test
    @DisplayName("Should generate a token with correct length")
    void testGenerateAccessToken_CorrectLength() {
        String token = tokenGenerator.generateAccessToken();
        assertEquals(DEFAULT_TOKEN_LENGTH, token.length(),
            "Generated token should be 12 characters long");
    }

    @Test
    @DisplayName("Should generate tokens that contain only alphanumeric characters")
    void testGenerateAccessToken_AlphanumericOnly() {
        String token = tokenGenerator.generateAccessToken();
        assertTrue(token.matches(ALPHANUMERIC_PATTERN),
            "Token should contain only a-z, A-Z, and 0-9");
    }

    @Test
    @DisplayName("Should generate unique tokens")
    void testGenerateAccessToken_Uniqueness() {
        Set<String> tokens = new HashSet<>();
        int tokenCount = 100;

        for (int i = 0; i < tokenCount; i++) {
            tokens.add(tokenGenerator.generateAccessToken());
        }

        assertEquals(tokenCount, tokens.size(),
            "All generated tokens should be unique");
    }

    @Test
    @DisplayName("Should generate tokens with custom length")
    void testGenerateAccessToken_CustomLength() {
        int[] lengths = {8, 10, 12, 16, 20, 32};

        for (int length : lengths) {
            String token = tokenGenerator.generateAccessToken(length);
            assertEquals(length, token.length(),
                "Generated token should be " + length + " characters long");
            assertTrue(token.matches(ALPHANUMERIC_PATTERN),
                "Custom length token should be alphanumeric");
        }
    }

    @Test
    @DisplayName("Should throw exception for invalid token length (too short)")
    void testGenerateAccessToken_TooShort() {
        assertThrows(IllegalArgumentException.class, () ->
            tokenGenerator.generateAccessToken(7),
            "Should throw exception for token length < 8"
        );
    }

    @Test
    @DisplayName("Should throw exception for invalid token length (too long)")
    void testGenerateAccessToken_TooLong() {
        assertThrows(IllegalArgumentException.class, () ->
            tokenGenerator.generateAccessToken(33),
            "Should throw exception for token length > 32"
        );
    }

    @Test
    @DisplayName("Should validate correct token format")
    void testIsValidTokenFormat_ValidToken() {
        String validToken = tokenGenerator.generateAccessToken();
        assertTrue(tokenGenerator.isValidTokenFormat(validToken),
            "Generated token should be valid format");
    }

    @Test
    @DisplayName("Should reject null token")
    void testIsValidTokenFormat_NullToken() {
        assertFalse(tokenGenerator.isValidTokenFormat(null),
            "Null token should be invalid");
    }

    @Test
    @DisplayName("Should reject empty token")
    void testIsValidTokenFormat_EmptyToken() {
        assertFalse(tokenGenerator.isValidTokenFormat(""),
            "Empty token should be invalid");
    }

    @Test
    @DisplayName("Should reject token with invalid characters")
    void testIsValidTokenFormat_InvalidCharacters() {
        String[] invalidTokens = {
            "abc-def-ghij",  // Contains hyphens
            "abc def ghij",   // Contains spaces
            "abc@defghij",    // Contains special character
            "abc_defghij",    // Contains underscore
            "abc!defghij"     // Contains exclamation
        };

        for (String token : invalidTokens) {
            assertFalse(tokenGenerator.isValidTokenFormat(token),
                "Token with invalid characters should be rejected: " + token);
        }
    }

    @Test
    @DisplayName("Should reject token that is too short")
    void testIsValidTokenFormat_TooShort() {
        assertFalse(tokenGenerator.isValidTokenFormat("abcdefg"),
            "Token shorter than 8 characters should be invalid");
    }

    @Test
    @DisplayName("Should reject token that is too long")
    void testIsValidTokenFormat_TooLong() {
        String longToken = "a".repeat(33);
        assertFalse(tokenGenerator.isValidTokenFormat(longToken),
            "Token longer than 32 characters should be invalid");
    }

    @Test
    @DisplayName("Should accept token with minimum valid length")
    void testIsValidTokenFormat_MinimumLength() {
        String minToken = tokenGenerator.generateAccessToken(8);
        assertTrue(tokenGenerator.isValidTokenFormat(minToken),
            "Token with 8 characters should be valid");
    }

    @Test
    @DisplayName("Should accept token with maximum valid length")
    void testIsValidTokenFormat_MaximumLength() {
        String maxToken = tokenGenerator.generateAccessToken(32);
        assertTrue(tokenGenerator.isValidTokenFormat(maxToken),
            "Token with 32 characters should be valid");
    }

    @Test
    @DisplayName("Should calculate entropy correctly")
    void testCalculateTokenEntropy_Correct() {
        double entropy12 = tokenGenerator.calculateTokenEntropy(12);
        double entropy16 = tokenGenerator.calculateTokenEntropy(16);

        // 12-character token: 12 * log2(62) ≈ 71.4 bits
        assertTrue(entropy12 > 70 && entropy12 < 72,
            "12-character token entropy should be approximately 71.4 bits");

        // 16-character token: 16 * log2(62) ≈ 95.2 bits
        assertTrue(entropy16 > 94 && entropy16 < 96,
            "16-character token entropy should be approximately 95.2 bits");

        // Longer token should have higher entropy
        assertTrue(entropy16 > entropy12,
            "Longer tokens should have higher entropy");
    }

    @Test
    @DisplayName("Should provide token generation info")
    void testGetTokenGenerationInfo() {
        String info = tokenGenerator.getTokenGenerationInfo();
        assertNotNull(info, "Token generation info should not be null");
        assertTrue(info.contains("SecureRandom"), "Info should mention SecureRandom");
        assertTrue(info.contains("62^12"), "Info should mention combinations");
        assertTrue(info.contains("bits"), "Info should mention entropy");
    }

    @Test
    @DisplayName("Should generate different tokens on subsequent calls")
    void testGenerateAccessToken_Randomness() {
        String token1 = tokenGenerator.generateAccessToken();
        String token2 = tokenGenerator.generateAccessToken();
        String token3 = tokenGenerator.generateAccessToken();

        assertNotEquals(token1, token2, "Two consecutive tokens should be different");
        assertNotEquals(token2, token3, "Two consecutive tokens should be different");
        assertNotEquals(token1, token3, "Two tokens should be different");
    }

    @Test
    @DisplayName("Should generate tokens with good character distribution")
    void testGenerateAccessToken_CharacterDistribution() {
        // Generate a large number of tokens and verify character diversity
        Set<Character> characterSet = new HashSet<>();
        int tokenCount = 1000;

        for (int i = 0; i < tokenCount; i++) {
            String token = tokenGenerator.generateAccessToken();
            for (char c : token.toCharArray()) {
                characterSet.add(c);
            }
        }

        // Should have a reasonable distribution (at least 30 different characters)
        assertTrue(characterSet.size() >= 30,
            "Generated tokens should contain diverse characters");
    }
}
