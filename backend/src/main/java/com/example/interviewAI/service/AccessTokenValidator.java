package com.example.interviewAI.service;

import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.repository.InterviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service for validating and retrieving interview sessions using access tokens.
 *
 * This service provides secure token validation and interview lookup functionality
 * for candidate and observer access to interview sessions.
 *
 * @author Interview AI Team
 * @since 1.0
 */
@Slf4j
@Service
public class AccessTokenValidator {

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private AccessTokenGenerator tokenGenerator;

    /**
     * Validates and retrieves an interview by its access token.
     *
     * This method performs both format validation and database lookup, ensuring
     * that the token is valid and corresponds to an active interview.
     *
     * @param accessToken The access token (e.g., "xK9mPq2nR4vL")
     * @return The Interview entity if valid and found
     * @throws UnauthorizedException if the token format is invalid
     * @throws ResourceNotFoundException if the token doesn't correspond to any interview
     */
    public Interview getInterviewByAccessToken(String accessToken) {
        // Validate token format
        if (!tokenGenerator.isValidTokenFormat(accessToken)) {
            log.warn("Invalid token format received: {}", maskToken(accessToken));
            throw new UnauthorizedException("Invalid access token format");
        }

        // Lookup interview by token
        Optional<Interview> interview = interviewRepository.findByInterviewLinkToken(accessToken);

        if (interview.isEmpty()) {
            log.warn("No interview found for token: {}", maskToken(accessToken));
            throw new ResourceNotFoundException("Invalid or expired interview link");
        }

        log.debug("Valid access token resolved to interview ID: {}", interview.get().getId());
        return interview.get();
    }

    /**
     * Validates if an access token exists and is active.
     *
     * @param accessToken The access token to validate
     * @return true if the token is valid and corresponds to an active interview, false otherwise
     */
    public boolean isAccessTokenValid(String accessToken) {
        try {
            // Check format
            if (!tokenGenerator.isValidTokenFormat(accessToken)) {
                return false;
            }

            // Check if interview exists
            Optional<Interview> interview = interviewRepository.findByInterviewLinkToken(accessToken);
            return interview.isPresent();
        } catch (Exception e) {
            log.error("Error validating access token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Checks if an interview is accessible via its access token.
     *
     * An interview is accessible if:
     * 1. The token format is valid
     * 2. The interview exists in the database
     * 3. The interview status is not "cancelled"
     *
     * @param accessToken The access token
     * @return true if the interview is accessible, false otherwise
     */
    public boolean isInterviewAccessible(String accessToken) {
        try {
            Interview interview = getInterviewByAccessToken(accessToken);
            // Interview is accessible if not cancelled
            return !"cancelled".equalsIgnoreCase(interview.getStatus());
        } catch (Exception e) {
            log.debug("Interview not accessible with token: {}", maskToken(accessToken));
            return false;
        }
    }

    /**
     * Retrieves interview information for candidate access.
     *
     * This is a convenience method that combines token validation with interview retrieval.
     *
     * @param accessToken The access token provided to the candidate
     * @return The Interview entity with full details
     * @throws UnauthorizedException if token is invalid or interview is not accessible
     */
    public Interview getAccessibleInterview(String accessToken) {
        if (!isInterviewAccessible(accessToken)) {
            throw new UnauthorizedException("This interview is no longer accessible");
        }

        return getInterviewByAccessToken(accessToken);
    }

    /**
     * Validates that the token belongs to a specific interview.
     *
     * @param interviewId The interview ID to check
     * @param accessToken The access token to validate
     * @return true if the token matches the interview, false otherwise
     */
    public boolean validateTokenForInterview(Long interviewId, String accessToken) {
        try {
            Optional<Interview> interview = interviewRepository.findByIdAndInterviewLinkToken(interviewId, accessToken);
            return interview.isPresent();
        } catch (Exception e) {
            log.error("Error validating token for interview {}: {}", interviewId, e.getMessage());
            return false;
        }
    }

    /**
     * Masks sensitive token information for logging purposes.
     *
     * Shows only the first 4 and last 2 characters for security.
     * Example: "xK9mPq2nR4vL" becomes "xK9m****vL"
     *
     * @param token The token to mask
     * @return The masked token
     */
    private String maskToken(String token) {
        if (token == null || token.length() < 6) {
            return "***";
        }
        return token.substring(0, 4) + "****" + token.substring(token.length() - 2);
    }

    /**
     * Gets debugging information about token validation.
     *
     * @return A string with validation details
     */
    public String getValidationInfo() {
        return "Access Token Validator:\n" +
               "- Validates token format (alphanumeric, 8-32 chars)\n" +
               "- Looks up interview from database\n" +
               "- Checks if interview is not cancelled\n" +
               "- Masks sensitive data in logs";
    }
}
