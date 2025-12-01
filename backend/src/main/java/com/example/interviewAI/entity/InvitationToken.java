package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitation_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvitationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_id", nullable = false)
    private User invitedBy;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime acceptedAt;

    /**
     * Create a new invitation token
     * Token expires after 7 days
     */
    public static InvitationToken create(Company company, String email, User invitedBy) {
        InvitationToken token = new InvitationToken();
        token.setToken(UUID.randomUUID().toString());
        token.setCompany(company);
        token.setEmail(email);
        token.setInvitedBy(invitedBy);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusDays(7));
        return token;
    }

    /**
     * Check if token is expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if token has been accepted
     */
    public boolean isAccepted() {
        return acceptedAt != null;
    }

    /**
     * Check if token is valid (not expired and not accepted)
     */
    public boolean isValid() {
        return !isExpired() && !isAccepted();
    }

    /**
     * Mark token as accepted
     */
    public void markAsAccepted() {
        this.acceptedAt = LocalDateTime.now();
    }
}
