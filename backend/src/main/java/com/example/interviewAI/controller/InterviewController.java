package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CreateInterviewRequest;
import com.example.interviewAI.dto.InterviewResponse;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.security.JwtTokenProvider;
import com.example.interviewAI.service.InterviewService;
import com.example.interviewAI.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/interviews")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all interviews for the authenticated user's company
     */
    @GetMapping
    public ResponseEntity<?> getInterviews(
            @RequestHeader("Authorization") String bearerToken,
            @RequestParam(required = false) String status) {
        try {
            User user = extractUserFromToken(bearerToken);

            List<InterviewResponse> interviews;
            if (status != null && !status.isEmpty()) {
                interviews = interviewService.getInterviewsByCompanyAndStatus(user.getCompany().getId(), status);
            } else {
                interviews = interviewService.getInterviewsByCompany(user.getCompany().getId());
            }

            return ResponseEntity.ok(interviews);
        } catch (Exception e) {
            log.error("Error fetching interviews: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch interviews"));
        }
    }

    /**
     * Get a specific interview by ID
     */
    @GetMapping("/{interviewId}")
    public ResponseEntity<?> getInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        try {
            User user = extractUserFromToken(bearerToken);
            InterviewResponse interview = interviewService.getInterviewById(interviewId);

            // Authorization: Admin can see all, Interviewer can only see their own
            if (!isUserAuthorizedForInterview(user, interview)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You are not authorized to view this interview"));
            }

            return ResponseEntity.ok(interview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching interview: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch interview"));
        }
    }

    /**
     * Get interview by link token (for candidates)
     */
    @GetMapping("/link/{token}")
    public ResponseEntity<?> getInterviewByToken(@PathVariable String token) {
        try {
            InterviewResponse interview = interviewService.getInterviewByToken(token);
            return ResponseEntity.ok(interview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching interview by token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to fetch interview"));
        }
    }

    /**
     * Create a new interview
     */
    @PostMapping
    public ResponseEntity<?> createInterview(
            @Valid @RequestBody CreateInterviewRequest request,
            @RequestHeader("Authorization") String bearerToken) {
        try {
            User user = extractUserFromToken(bearerToken);

            // Validate user can create interviews
            if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You are not authorized to create interviews"));
            }

            InterviewResponse interview = interviewService.createInterview(
                    user.getCompany().getId(),
                    request,
                    user.getId()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(interview);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating interview: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create interview"));
        }
    }

    /**
     * Update interview status
     */
    @PutMapping("/{interviewId}")
    public ResponseEntity<?> updateInterviewStatus(
            @PathVariable Long interviewId,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String bearerToken) {
        try {
            User user = extractUserFromToken(bearerToken);
            String newStatus = body.get("status");

            if (newStatus == null || newStatus.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Status is required"));
            }

            InterviewResponse interview = interviewService.getInterviewById(interviewId);

            // Authorization check
            if (!isUserAuthorizedForInterview(user, interview)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You are not authorized to update this interview"));
            }

            InterviewResponse updated = interviewService.updateInterviewStatus(interviewId, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating interview status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update interview"));
        }
    }

    /**
     * Start an interview
     */
    @PostMapping("/{interviewId}/start")
    public ResponseEntity<?> startInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        try {
            User user = extractUserFromToken(bearerToken);
            InterviewResponse interview = interviewService.getInterviewById(interviewId);

            // Authorization check
            if (!isUserAuthorizedForInterview(user, interview)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You are not authorized to start this interview"));
            }

            InterviewResponse started = interviewService.startInterview(interviewId);
            return ResponseEntity.ok(started);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error starting interview: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to start interview"));
        }
    }

    /**
     * Complete an interview
     */
    @PostMapping("/{interviewId}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long interviewId,
            @RequestHeader("Authorization") String bearerToken) {
        try {
            User user = extractUserFromToken(bearerToken);
            InterviewResponse interview = interviewService.getInterviewById(interviewId);

            // Authorization check
            if (!isUserAuthorizedForInterview(user, interview)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("You are not authorized to complete this interview"));
            }

            InterviewResponse completed = interviewService.completeInterview(interviewId);
            return ResponseEntity.ok(completed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error completing interview: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to complete interview"));
        }
    }

    /**
     * Helper method to extract user from JWT token
     */
    private User extractUserFromToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid token format");
        }

        String token = bearerToken.replace("Bearer ", "");
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return user;
    }

    /**
     * Helper method to check if user is authorized to access an interview
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

    /**
     * Helper method to create error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }
}
