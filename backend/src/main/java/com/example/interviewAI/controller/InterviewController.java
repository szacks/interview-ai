package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CreateInterviewRequest;
import com.example.interviewAI.dto.InterviewResponse;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.exception.BadRequestException;
import com.example.interviewAI.exception.ForbiddenException;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.security.JwtTokenProvider;
import com.example.interviewAI.service.InterviewService;
import com.example.interviewAI.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * REST controller for interview management operations.
 * Handles CRUD operations and status transitions for interviews.
 */
@Slf4j
@RestController
@RequestMapping("/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    /**
     * Get all interviews for the authenticated user's company.
     *
     * @param bearerToken JWT token from Authorization header
     * @param status optional filter by interview status
     * @return list of interviews
     */
    @GetMapping
    public ResponseEntity<List<InterviewResponse>> getInterviews(
            @RequestHeader("Authorization") String bearerToken,
            @RequestParam(required = false) String status) {
        log.debug("Fetching interviews with status filter: {}", status);
        User user = extractUserFromToken(bearerToken);

        List<InterviewResponse> interviews;
        if (status != null && !status.isEmpty()) {
            interviews = interviewService.getInterviewsByCompanyAndStatus(user.getCompany().getId(), status);
        } else {
            interviews = interviewService.getInterviewsByCompany(user.getCompany().getId());
        }

        return ResponseEntity.ok(interviews);
    }

    /**
     * Get a specific interview by ID.
     *
     * @param interviewId interview identifier
     * @param bearerToken JWT token from Authorization header
     * @return interview details
     */
    @GetMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> getInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        log.debug("Fetching interview with ID: {}", interviewId);
        User user = extractUserFromToken(bearerToken);
        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        // Authorization: Admin can see all, Interviewer can only see their own
        if (!isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to view this interview");
        }

        return ResponseEntity.ok(interview);
    }

    /**
     * Get interview by link token (for candidates).
     *
     * @param token interview link token
     * @return interview details
     */
    @GetMapping("/link/{token}")
    public ResponseEntity<InterviewResponse> getInterviewByToken(@PathVariable String token) {
        log.debug("Fetching interview with token: {}", token);
        InterviewResponse interview = interviewService.getInterviewByToken(token);
        return ResponseEntity.ok(interview);
    }

    /**
     * Create a new interview.
     *
     * @param request interview creation details
     * @param bearerToken JWT token from Authorization header
     * @return created interview
     */
    @PostMapping
    public ResponseEntity<InterviewResponse> createInterview(
            @Valid @RequestBody CreateInterviewRequest request,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Creating new interview");
        User user = extractUserFromToken(bearerToken);

        // Validate user can create interviews
        if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
            throw new ForbiddenException("You are not authorized to create interviews");
        }

        InterviewResponse interview = interviewService.createInterview(
                user.getCompany().getId(),
                request,
                user.getId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(interview);
    }

    /**
     * Update interview status.
     *
     * @param interviewId interview identifier
     * @param body request body containing new status
     * @param bearerToken JWT token from Authorization header
     * @return updated interview
     */
    @PutMapping("/{interviewId}")
    public ResponseEntity<InterviewResponse> updateInterviewStatus(
            @PathVariable Long interviewId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Updating interview status for ID: {}", interviewId);
        User user = extractUserFromToken(bearerToken);
        String newStatus = body.get("status");

        if (newStatus == null || newStatus.isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        // Authorization check
        if (!isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to update this interview");
        }

        InterviewResponse updated = interviewService.updateInterviewStatus(interviewId, newStatus);
        return ResponseEntity.ok(updated);
    }

    /**
     * Start an interview.
     *
     * @param interviewId interview identifier
     * @param bearerToken JWT token from Authorization header
     * @return started interview
     */
    @PostMapping("/{interviewId}/start")
    public ResponseEntity<InterviewResponse> startInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Starting interview with ID: {}", interviewId);
        User user = extractUserFromToken(bearerToken);
        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        // Authorization check
        if (!isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to start this interview");
        }

        InterviewResponse started = interviewService.startInterview(interviewId);
        return ResponseEntity.ok(started);
    }

    /**
     * Complete an interview.
     *
     * @param interviewId interview identifier
     * @param bearerToken JWT token from Authorization header
     * @return completed interview
     */
    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<InterviewResponse> completeInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Completing interview with ID: {}", interviewId);
        User user = extractUserFromToken(bearerToken);
        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        // Authorization check
        if (!isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to complete this interview");
        }

        InterviewResponse completed = interviewService.completeInterview(interviewId);
        return ResponseEntity.ok(completed);
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

    /**
     * Check if user is authorized to access an interview.
     *
     * @param user authenticated user
     * @param interview interview to check access for
     * @return true if authorized, false otherwise
     */
    private boolean isUserAuthorizedForInterview(User user, InterviewResponse interview) {
        // Admins can access all interviews in their company
        if (user.getRole().equals(RoleEnum.ADMIN)) {
            return user.getCompany() != null &&
                   user.getCompany().getId().equals(interview.getCompanyId());
        }

        // Interviewers can only access interviews they're assigned to
        if (user.getRole().equals(RoleEnum.INTERVIEWER)) {
            return user.getId().equals(interview.getInterviewerId());
        }

        return false;
    }
}
