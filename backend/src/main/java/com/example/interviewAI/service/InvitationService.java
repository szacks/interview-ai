package com.example.interviewAI.service;

import com.example.interviewAI.dto.InviteInterviewerRequest;
import com.example.interviewAI.dto.InviteInterviewerResponse;
import com.example.interviewAI.dto.PendingInvitationResponse;
import com.example.interviewAI.dto.TeamMemberResponse;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.InvitationToken;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.InvitationTokenRepository;
import com.example.interviewAI.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InvitationService {

    @Autowired
    private InvitationTokenRepository invitationTokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Generate and send invitation to a new interviewer
     */
    @Transactional
    public InviteInterviewerResponse sendInvitation(Long companyId, InviteInterviewerRequest request, User invitedBy) {
        // Get company
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Check if there's already a pending invitation for this email
        List<InvitationToken> pendingInvitations = invitationTokenRepository.findByEmailAndAcceptedAtIsNull(request.getEmail());
        if (!pendingInvitations.isEmpty()) {
            // Check if any are still valid
            for (InvitationToken token : pendingInvitations) {
                if (!token.isExpired()) {
                    throw new IllegalArgumentException("An active invitation already exists for this email");
                }
            }
        }

        // Create invitation token
        InvitationToken invitationToken = InvitationToken.create(company, request.getEmail(), invitedBy);
        invitationToken = invitationTokenRepository.save(invitationToken);

        // Build invitation link
        String invitationLink = frontendUrl + "/auth/accept-invitation?token=" + invitationToken.getToken();

        // Send invitation email
        emailService.sendInvitationEmail(
                request.getEmail(),
                invitedBy.getName(),
                company.getName(),
                invitationLink
        );

        log.info("Invitation sent to {} for company {} by {}", request.getEmail(), company.getName(), invitedBy.getEmail());

        // Return response
        InviteInterviewerResponse response = new InviteInterviewerResponse();
        response.setEmail(request.getEmail());
        response.setMessage("Invitation sent successfully to " + request.getEmail());
        response.setInvitationLink(invitationLink);

        return response;
    }

    /**
     * Accept invitation and create user account
     */
    @Transactional
    public User acceptInvitation(String token, String password, String name) {
        // Find invitation token
        InvitationToken invitationToken = invitationTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token"));

        // Check if token is valid
        if (!invitationToken.isValid()) {
            if (invitationToken.isAccepted()) {
                throw new IllegalArgumentException("This invitation has already been accepted");
            } else {
                throw new IllegalArgumentException("This invitation has expired");
            }
        }

        // Create user
        User user = new User();
        user.setEmail(invitationToken.getEmail());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(RoleEnum.INTERVIEWER);
        user.setCompany(invitationToken.getCompany());
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        // Mark invitation as accepted
        invitationToken.markAsAccepted();
        invitationTokenRepository.save(invitationToken);

        log.info("Invitation accepted and user created: {}", user.getEmail());

        return user;
    }

    /**
     * Get pending invitations for a company
     */
    public List<PendingInvitationResponse> getPendingInvitations(Long companyId) {
        List<InvitationToken> invitations = invitationTokenRepository.findByCompanyIdAndAcceptedAtIsNull(companyId);

        return invitations.stream()
                .filter(token -> !token.isExpired())
                .map(token -> {
                    PendingInvitationResponse response = new PendingInvitationResponse();
                    response.setId(token.getId());
                    response.setEmail(token.getEmail());
                    response.setInvitedByName(token.getInvitedBy().getName());
                    response.setInvitedAt(token.getCreatedAt());
                    response.setExpiresAt(token.getExpiresAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get team members (interviewers) for a company
     */
    public List<TeamMemberResponse> getTeamMembers(Long companyId) {
        List<User> users = userRepository.findByCompanyIdAndRole(companyId, RoleEnum.INTERVIEWER);

        return users.stream()
                .map(user -> {
                    TeamMemberResponse response = new TeamMemberResponse();
                    response.setId(user.getId());
                    response.setEmail(user.getEmail());
                    response.setName(user.getName());
                    response.setRole(user.getRole().getValue());
                    response.setJoinedAt(user.getCreatedAt());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Cancel an invitation
     */
    @Transactional
    public void cancelInvitation(Long invitationId) {
        InvitationToken invitationToken = invitationTokenRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (invitationToken.isAccepted()) {
            throw new IllegalArgumentException("Cannot cancel an accepted invitation");
        }

        invitationTokenRepository.delete(invitationToken);
        log.info("Invitation cancelled: {}", invitationToken.getEmail());
    }

    /**
     * Resend invitation
     */
    @Transactional
    public void resendInvitation(Long invitationId) {
        InvitationToken invitationToken = invitationTokenRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (invitationToken.isAccepted()) {
            throw new IllegalArgumentException("Cannot resend an accepted invitation");
        }

        if (invitationToken.isExpired()) {
            throw new IllegalArgumentException("Invitation has expired");
        }

        // Build invitation link
        String invitationLink = frontendUrl + "/auth/accept-invitation?token=" + invitationToken.getToken();

        // Send invitation email
        emailService.sendInvitationEmail(
                invitationToken.getEmail(),
                invitationToken.getInvitedBy().getName(),
                invitationToken.getCompany().getName(),
                invitationLink
        );

        log.info("Invitation resent to {}", invitationToken.getEmail());
    }
}
