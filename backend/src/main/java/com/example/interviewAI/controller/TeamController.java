package com.example.interviewAI.controller;

import com.example.interviewAI.dto.InviteInterviewerRequest;
import com.example.interviewAI.dto.InviteInterviewerResponse;
import com.example.interviewAI.dto.PendingInvitationResponse;
import com.example.interviewAI.dto.TeamMemberResponse;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.service.InvitationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * REST controller for team management operations.
 * Handles team member invitations and management.
 */
@Slf4j
@RestController
@RequestMapping("/teams")
@RequiredArgsConstructor
public class TeamController {

    private final InvitationService invitationService;
    private final UserRepository userRepository;

    /**
     * Send invitation to a new interviewer.
     *
     * @param request invitation details
     * @param authentication current user authentication
     * @return invitation response
     */
    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InviteInterviewerResponse> inviteInterviewer(
            @Valid @RequestBody InviteInterviewerRequest request,
            Authentication authentication) {
        log.info("Sending invitation to: {}", request.getEmail());

        // Get current user
        String currentUserEmail = (String) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        // Send invitation
        InviteInterviewerResponse response = invitationService.sendInvitation(
                currentUser.getCompany().getId(),
                request,
                currentUser
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get team members (interviewers) for the company.
     *
     * @param authentication current user authentication
     * @return list of team members
     */
    @GetMapping("/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(Authentication authentication) {
        log.debug("Fetching team members");

        // Get current user
        String currentUserEmail = (String) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        // Get team members
        List<TeamMemberResponse> members = invitationService.getTeamMembers(currentUser.getCompany().getId());

        return ResponseEntity.ok(members);
    }

    /**
     * Get pending invitations for the company.
     *
     * @param authentication current user authentication
     * @return list of pending invitations
     */
    @GetMapping("/pending-invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PendingInvitationResponse>> getPendingInvitations(Authentication authentication) {
        log.debug("Fetching pending invitations");

        // Get current user
        String currentUserEmail = (String) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        // Get pending invitations
        List<PendingInvitationResponse> invitations = invitationService.getPendingInvitations(
                currentUser.getCompany().getId()
        );

        return ResponseEntity.ok(invitations);
    }

    /**
     * Cancel an invitation.
     *
     * @param invitationId invitation identifier
     * @return success message
     */
    @DeleteMapping("/invitations/{invitationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cancelInvitation(@PathVariable Long invitationId) {
        log.info("Cancelling invitation with ID: {}", invitationId);
        invitationService.cancelInvitation(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation cancelled successfully"));
    }

    /**
     * Resend an invitation.
     *
     * @param invitationId invitation identifier
     * @return success message
     */
    @PostMapping("/invitations/{invitationId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> resendInvitation(@PathVariable Long invitationId) {
        log.info("Resending invitation with ID: {}", invitationId);
        invitationService.resendInvitation(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation resent successfully"));
    }
}
