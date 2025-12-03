package com.example.interviewAI.controller;

import com.example.interviewAI.entity.Evaluation;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.exception.ForbiddenException;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.security.JwtTokenProvider;
import com.example.interviewAI.service.EvaluationService;
import com.example.interviewAI.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for interview evaluation operations.
 * Handles AI-powered evaluation generation and management.
 */
@Slf4j
@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    /**
     * Generate AI evaluation for an interview session.
     *
     * @param interviewSessionId interview session identifier
     * @param bearerToken JWT token from Authorization header
     * @return generated evaluation
     */
    @PostMapping("/interview-sessions/{interviewSessionId}/generate")
    public ResponseEntity<Evaluation> generateEvaluation(
            @PathVariable Long interviewSessionId,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Generating AI evaluation for interview session: {}", interviewSessionId);
        User user = extractUserFromToken(bearerToken);

        // Authorization: Admin can generate evaluations
        if (!user.getRole().equals(RoleEnum.ADMIN)) {
            throw new ForbiddenException("You are not authorized to generate evaluations");
        }

        Evaluation evaluation = evaluationService.generateAIEvaluation(interviewSessionId);
        if (evaluation == null) {
            throw new ResourceNotFoundException("Evaluation", "interviewSessionId", interviewSessionId);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
    }

    /**
     * Get evaluation for an interview session.
     *
     * @param interviewSessionId interview session identifier
     * @param bearerToken JWT token from Authorization header
     * @return evaluation details
     */
    @GetMapping("/interview-sessions/{interviewSessionId}")
    public ResponseEntity<Evaluation> getEvaluation(
            @PathVariable Long interviewSessionId,
            @RequestHeader("Authorization") String bearerToken) {
        log.debug("Fetching evaluation for interview session: {}", interviewSessionId);
        User user = extractUserFromToken(bearerToken);

        // Authorization: Admin or Interviewer
        if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
            throw new ForbiddenException("You are not authorized to view evaluations");
        }

        Evaluation evaluation = evaluationService.getEvaluation(interviewSessionId);
        if (evaluation == null) {
            throw new ResourceNotFoundException("Evaluation", "interviewSessionId", interviewSessionId);
        }

        return ResponseEntity.ok(evaluation);
    }

    /**
     * Update evaluation with manual scores and notes.
     *
     * @param evaluationId evaluation identifier
     * @param body request body containing manual score, notes, and recommendation
     * @param bearerToken JWT token from Authorization header
     * @return updated evaluation
     */
    @PutMapping("/{evaluationId}")
    public ResponseEntity<Evaluation> updateEvaluation(
            @PathVariable Long evaluationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Updating evaluation with ID: {}", evaluationId);
        User user = extractUserFromToken(bearerToken);

        // Authorization: Admin can update evaluations
        if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
            throw new ForbiddenException("You are not authorized to update evaluations");
        }

        Integer manualScore = body.get("manualScore") != null ? ((Number) body.get("manualScore")).intValue() : null;
        String interviewerNotes = (String) body.get("interviewerNotes");
        String recommendation = (String) body.get("recommendation");

        Evaluation updated = evaluationService.updateEvaluation(evaluationId, manualScore, interviewerNotes, recommendation);
        if (updated == null) {
            throw new ResourceNotFoundException("Evaluation", "id", evaluationId);
        }

        return ResponseEntity.ok(updated);
    }

    /**
     * Delete an evaluation.
     *
     * @param evaluationId evaluation identifier
     * @param bearerToken JWT token from Authorization header
     * @return success response
     */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Map<String, String>> deleteEvaluation(
            @PathVariable Long evaluationId,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Deleting evaluation with ID: {}", evaluationId);
        User user = extractUserFromToken(bearerToken);

        // Authorization: Admin only
        if (!user.getRole().equals(RoleEnum.ADMIN)) {
            throw new ForbiddenException("You are not authorized to delete evaluations");
        }

        boolean deleted = evaluationService.deleteEvaluation(evaluationId);
        if (!deleted) {
            throw new ResourceNotFoundException("Evaluation", "id", evaluationId);
        }

        return ResponseEntity.ok(Map.of("message", "Evaluation deleted successfully"));
    }

    /**
     * Extract user from JWT token.
     *
     * @param bearerToken JWT token with Bearer prefix
     * @return authenticated user
     * @throws UnauthorizedException if token is invalid
     * @throws ResourceNotFoundException if user not found
     */
    private User extractUserFromToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid token format");
        }

        String token = bearerToken.replace("Bearer ", "");
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
