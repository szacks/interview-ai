package com.example.interviewAI.controller;

import com.example.interviewAI.dto.InviteInterviewerRequest;
import com.example.interviewAI.dto.InviteInterviewerResponse;
import com.example.interviewAI.dto.PendingInvitationResponse;
import com.example.interviewAI.dto.TeamMemberResponse;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.service.InvitationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/teams")
public class TeamController {

    @Autowired
    private InvitationService invitationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Send invitation to a new interviewer
     */
    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> inviteInterviewer(@Valid @RequestBody InviteInterviewerRequest request,
                                              Authentication authentication) {
        try {
            // Get current user
            String currentUserEmail = (String) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

            // Send invitation
            InviteInterviewerResponse response = invitationService.sendInvitation(
                    currentUser.getCompany().getId(),
                    request,
                    currentUser
            );

            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (IllegalArgumentException e) {
            InviteInterviewerResponse errorResponse = new InviteInterviewerResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error sending invitation: {}", e.getMessage(), e);
            InviteInterviewerResponse errorResponse = new InviteInterviewerResponse();
            errorResponse.setMessage("Error sending invitation");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get team members (interviewers) for the company
     */
    @GetMapping("/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<?> getTeamMembers(Authentication authentication) {
        try {
            // Get current user
            String currentUserEmail = (String) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

            // Get team members
            List<TeamMemberResponse> members = invitationService.getTeamMembers(currentUser.getCompany().getId());

            return ResponseEntity.ok(members);
        } catch (Exception e) {
            log.error("Error getting team members: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting team members");
        }
    }

    /**
     * Get pending invitations for the company
     */
    @GetMapping("/pending-invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingInvitations(Authentication authentication) {
        try {
            // Get current user
            String currentUserEmail = (String) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Current user not found"));

            // Get pending invitations
            List<PendingInvitationResponse> invitations = invitationService.getPendingInvitations(
                    currentUser.getCompany().getId()
            );

            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            log.error("Error getting pending invitations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting pending invitations");
        }
    }

    /**
     * Cancel an invitation
     */
    @DeleteMapping("/invitations/{invitationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelInvitation(@PathVariable Long invitationId) {
        try {
            invitationService.cancelInvitation(invitationId);
            return ResponseEntity.ok().body("{\"message\": \"Invitation cancelled successfully\"}");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            log.error("Error cancelling invitation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error cancelling invitation\"}");
        }
    }

    /**
     * Resend an invitation
     */
    @PostMapping("/invitations/{invitationId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resendInvitation(@PathVariable Long invitationId) {
        try {
            invitationService.resendInvitation(invitationId);
            return ResponseEntity.ok().body("{\"message\": \"Invitation resent successfully\"}");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            log.error("Error resending invitation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error resending invitation\"}");
        }
    }
}
