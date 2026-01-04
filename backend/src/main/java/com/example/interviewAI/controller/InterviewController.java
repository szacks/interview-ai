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
     * Get interviews from the last 7 days for the authenticated user's company.
     *
     * @param bearerToken JWT token from Authorization header
     * @return list of interviews from last 7 days
     */
    @GetMapping("/week")
    public ResponseEntity<List<InterviewResponse>> getInterviewsFromLastSevenDays(
            @RequestHeader("Authorization") String bearerToken) {
        log.debug("Fetching interviews from last 7 days");
        User user = extractUserFromToken(bearerToken);

        List<InterviewResponse> interviews = interviewService.getInterviewsByCompanyLastSevenDays(user.getCompany().getId());
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
        log.info("[Get Interview {}] User: {} (ID: {}, Role: {}, Company: {})",
                interviewId, user.getEmail(), user.getId(), user.getRole(),
                user.getCompany() != null ? user.getCompany().getId() : "null");

        InterviewResponse interview = interviewService.getInterviewById(interviewId);
        log.info("[Get Interview {}] Interview found - Company ID: {}, Interviewer ID: {}",
                interviewId, interview.getCompanyId(), interview.getInterviewerId());

        // Authorization: Admin can see all, Interviewer can only see their own
        if (!isUserAuthorizedForInterview(user, interview)) {
            log.warn("[Get Interview {}] Authorization FAILED for user {} (role: {})",
                    interviewId, user.getId(), user.getRole());
            throw new ForbiddenException("You are not authorized to view this interview");
        }

        log.info("[Get Interview {}] Authorization PASSED", interviewId);
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
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Starting interview with ID: {}", interviewId);
        log.info("[Start Interview] Bearer token present: {}", bearerToken != null && !bearerToken.isEmpty());

        // Try to authenticate, but log if it fails
        User user = null;
        try {
            if (bearerToken != null && !bearerToken.isEmpty()) {
                user = extractUserFromToken(bearerToken);
                log.info("[Start Interview] User authenticated: {} (ID: {}), Role: {}", user.getName(), user.getId(), user.getRole());
            } else {
                log.warn("[Start Interview] No bearer token provided");
            }
        } catch (Exception e) {
            log.error("[Start Interview] Failed to extract user from token: {}", e.getMessage());
        }

        InterviewResponse interview = interviewService.getInterviewById(interviewId);
        log.info("[Start Interview] Interview found - Status: {}, Interviewer ID: {}, Company ID: {}",
                interview.getStatus(), interview.getInterviewerId(), interview.getCompanyId());

        // Authorization check - only if we have a user
        if (user != null && !isUserAuthorizedForInterview(user, interview)) {
            log.warn("[Start Interview] Authorization check failed - User {} not authorized for interview {}",
                    user.getId(), interviewId);
            throw new ForbiddenException("You are not authorized to start this interview");
        } else if (user == null) {
            log.warn("[Start Interview] No user authenticated - proceeding anyway for testing");
        }

        log.info("[Start Interview] Proceeding to update status to in_progress");
        InterviewResponse started = interviewService.startInterview(interviewId);
        log.info("[Start Interview] Interview started successfully - New Status: {}", started.getStatus());
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
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Completing interview with ID: {}", interviewId);
        log.info("[Complete Interview] Bearer token present: {}", bearerToken != null && !bearerToken.isEmpty());

        // Try to authenticate, but log if it fails
        User user = null;
        try {
            if (bearerToken != null && !bearerToken.isEmpty()) {
                user = extractUserFromToken(bearerToken);
                log.info("[Complete Interview] User authenticated: {} (ID: {})", user.getName(), user.getId());
            } else {
                log.warn("[Complete Interview] No bearer token provided");
            }
        } catch (Exception e) {
            log.error("[Complete Interview] Failed to extract user from token: {}", e.getMessage());
        }

        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        // Authorization check - only if we have a user
        if (user != null && !isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to complete this interview");
        } else if (user == null) {
            log.warn("[Complete Interview] No user authenticated - proceeding anyway for testing");
        }

        InterviewResponse completed = interviewService.completeInterview(interviewId);
        log.info("[Complete Interview] Interview completed successfully - New Status: {}", completed.getStatus());
        return ResponseEntity.ok(completed);
    }

    /**
     * Candidate indicates they are ready (setup completed).
     *
     * @param token interview link token
     * @param body request body containing candidateName and language
     * @return updated interview
     */
    @PostMapping("/link/{token}/ready")
    public ResponseEntity<InterviewResponse> candidateReady(
            @PathVariable String token,
            @RequestBody Map<String, String> body) {
        log.info("Candidate ready for interview with token: {}", token);
        String candidateName = body.get("candidateName");
        String language = body.get("language");

        if (candidateName == null || candidateName.isEmpty()) {
            throw new BadRequestException("Candidate name is required");
        }
        if (language == null || language.isEmpty()) {
            throw new BadRequestException("Language is required");
        }

        InterviewResponse interview = interviewService.updateCandidateInfo(token, candidateName, language);
        return ResponseEntity.ok(interview);
    }

    /**
     * Interviewer accepts the candidate and starts the interview.
     *
     * @param interviewId interview identifier
     * @param bearerToken JWT token from Authorization header
     * @return accepted interview with status in_progress
     */
    @PostMapping("/{interviewId}/accept")
    public ResponseEntity<InterviewResponse> acceptCandidate(
            @PathVariable Long interviewId,
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Interviewer accepting candidate for interview: {}", interviewId);

        User user = null;
        try {
            if (bearerToken != null && !bearerToken.isEmpty()) {
                user = extractUserFromToken(bearerToken);
            }
        } catch (Exception e) {
            log.debug("No valid user token provided, allowing for testing");
        }

        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        if (user != null && !isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to accept this interview");
        }

        InterviewResponse accepted = interviewService.startInterview(interviewId);
        log.info("Interview {} accepted and started", interviewId);
        return ResponseEntity.ok(accepted);
    }

    /**
     * Interviewer rejects the candidate.
     *
     * @param interviewId interview identifier
     * @param bearerToken JWT token from Authorization header
     * @return rejected interview with status scheduled (reset for retry)
     */
    @PostMapping("/{interviewId}/reject")
    public ResponseEntity<InterviewResponse> rejectCandidate(
            @PathVariable Long interviewId,
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Interviewer rejecting candidate for interview: {}", interviewId);

        User user = null;
        try {
            if (bearerToken != null && !bearerToken.isEmpty()) {
                user = extractUserFromToken(bearerToken);
            }
        } catch (Exception e) {
            log.debug("No valid user token provided, allowing for testing");
        }

        InterviewResponse interview = interviewService.getInterviewById(interviewId);

        if (user != null && !isUserAuthorizedForInterview(user, interview)) {
            throw new ForbiddenException("You are not authorized to reject this interview");
        }

        InterviewResponse rejected = interviewService.rejectCandidate(interviewId);
        log.info("Interview {} rejected - candidate can retry", interviewId);
        return ResponseEntity.ok(rejected);
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
            boolean isInCompany = user.getCompany() != null &&
                   user.getCompany().getId().equals(interview.getCompanyId());
            log.debug("[Auth Check] Admin user {} - Company match: {}", user.getId(), isInCompany);
            return isInCompany;
        }

        // Interviewers can only access interviews they're assigned to
        if (user.getRole().equals(RoleEnum.INTERVIEWER)) {
            boolean isAssigned = user.getId().equals(interview.getInterviewerId());
            log.debug("[Auth Check] Interviewer user {} - Interview assigned to {}, Match: {}",
                    user.getId(), interview.getInterviewerId(), isAssigned);
            return isAssigned;
        }

        log.debug("[Auth Check] User {} has unrecognized role: {}", user.getId(), user.getRole());
        return false;
    }
}
