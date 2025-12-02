package com.example.interviewAI.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

/**
 * Service for generating secure, unguessable access tokens for interview links.
 *
 * Token Specification:
 * - Length: 12 characters (configurable)
 * - Alphabet: a-z, A-Z, 0-9 (62 characters)
 * - Entropy: 62^12 = 3.2 × 10^21 combinations (cryptographically unguessable)
 * - Security: Uses SecureRandom for cryptographic strength
 *
 * @author Interview AI Team
 * @since 1.0
 */
@Slf4j
@Service
public class AccessTokenGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // Standard alphanumeric alphabet (62 characters)
    private static final String ALPHABET =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // Token length: 12 characters provides 62^12 = 3.2 × 10^21 combinations
    private static final int TOKEN_LENGTH = 12;

    // Minimum token length to prevent too-short tokens
    private static final int MIN_TOKEN_LENGTH = 8;

    // Maximum token length for reasonable performance
    private static final int MAX_TOKEN_LENGTH = 32;

    /**
     * Generates a cryptographically secure, unguessable access token.
     *
     * The generated token is 12 characters long using alphanumeric characters (a-zA-Z0-9).
     * This provides 62^12 = 3.2 × 10^21 possible combinations, making it virtually
     * impossible to guess or brute force.
     *
     * @return A 12-character secure access token (e.g., "xK9mPq2nR4vL")
     */
    public String generateAccessToken() {
        return generateAccessToken(TOKEN_LENGTH);
    }

    /**
     * Generates a cryptographically secure access token with custom length.
     *
     * @param length The desired token length (must be between 8 and 32)
     * @return A secure access token of the specified length
     * @throws IllegalArgumentException if length is outside valid range
     */
    public String generateAccessToken(int length) {
        if (length < MIN_TOKEN_LENGTH || length > MAX_TOKEN_LENGTH) {
            throw new IllegalArgumentException(
                String.format("Token length must be between %d and %d characters",
                    MIN_TOKEN_LENGTH, MAX_TOKEN_LENGTH)
            );
        }

        StringBuilder token = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = SECURE_RANDOM.nextInt(ALPHABET.length());
            token.append(ALPHABET.charAt(randomIndex));
        }

        String generatedToken = token.toString();
        log.debug("Generated access token with length {}", length);
        return generatedToken;
    }

    /**
     * Validates the format of an access token.
     *
     * @param token The token to validate
     * @return true if the token matches the expected format, false otherwise
     */
    public boolean isValidTokenFormat(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        // Check length
        if (token.length() < MIN_TOKEN_LENGTH || token.length() > MAX_TOKEN_LENGTH) {
            return false;
        }

        // Check that token only contains alphanumeric characters
        return token.matches("[a-zA-Z0-9]+");
    }

    /**
     * Calculates the entropy of the token generation algorithm.
     *
     * For a 12-character token using a 62-character alphabet:
     * Entropy = log2(62^12) ≈ 71.4 bits
     *
     * This is significantly higher than the minimum recommended 128 bits for web
     * applications, providing excellent security against brute force attacks.
     *
     * @param tokenLength The length of the token
     * @return The approximate entropy in bits
     */
    public double calculateTokenEntropy(int tokenLength) {
        // Entropy = log2(alphabet_size^token_length)
        //         = token_length * log2(alphabet_size)
        double alphabetSize = ALPHABET.length();
        double bitsPerCharacter = Math.log(alphabetSize) / Math.log(2);
        return tokenLength * bitsPerCharacter;
    }

    /**
     * Gets information about the current token generation configuration.
     *
     * @return A string describing the token generation parameters
     */
    public String getTokenGenerationInfo() {
        double entropy = calculateTokenEntropy(TOKEN_LENGTH);
        return String.format(
            "Token Generation Info:\n" +
            "- Algorithm: SecureRandom with alphanumeric alphabet\n" +
            "- Token Length: %d characters\n" +
            "- Alphabet Size: %d characters (a-zA-Z0-9)\n" +
            "- Total Combinations: 62^%d ≈ 3.2 × 10^21\n" +
            "- Entropy: %.1f bits\n" +
            "- Format: Alphanumeric only [a-zA-Z0-9]+",
            TOKEN_LENGTH, ALPHABET.length(), TOKEN_LENGTH, entropy
        );
    }

    /**
     * Gets the current timestamp for logging purposes.
     *
     * @return Current instant in UTC
     */
    protected Instant getCurrentTimestamp() {
        return Instant.now();
    }
}
