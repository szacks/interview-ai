package com.example.interviewAI.repository;

import com.example.interviewAI.entity.PasswordResetToken;
import com.example.interviewAI.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Find password reset token by token string
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Find the most recent unused token for a user
     */
    Optional<PasswordResetToken> findTopByUserAndUsedAtNullOrderByCreatedAtDesc(User user);

    /**
     * Delete all expired tokens
     */
    void deleteByExpiresAtBefore(LocalDateTime expiresAt);

    /**
     * Delete all tokens for a user (for cleanup after successful reset)
     */
    void deleteByUser(User user);
}
