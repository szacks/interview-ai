package com.example.interviewAI.repository;

import com.example.interviewAI.entity.InvitationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationTokenRepository extends JpaRepository<InvitationToken, Long> {
    Optional<InvitationToken> findByToken(String token);

    List<InvitationToken> findByCompanyId(Long companyId);

    List<InvitationToken> findByCompanyIdAndAcceptedAtIsNull(Long companyId);

    List<InvitationToken> findByEmailAndAcceptedAtIsNull(String email);
}
