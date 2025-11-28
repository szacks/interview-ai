package com.example.interviewAI.repository;

import com.example.interviewAI.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCompanyId(Long companyId);

    List<Interview> findByCompanyIdAndStatus(Long companyId, String status);

    List<Interview> findByCandidateId(Long candidateId);

    List<Interview> findByInterviewerId(Long interviewerId);

    Optional<Interview> findByInterviewLinkToken(String token);

    @Query("SELECT i FROM Interview i WHERE i.company.id = ?1 ORDER BY i.createdAt DESC")
    List<Interview> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    @Query("SELECT i FROM Interview i WHERE i.company.id = ?1 AND i.status = ?2 ORDER BY i.createdAt DESC")
    List<Interview> findByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    @Query("SELECT COUNT(i) FROM Interview i WHERE i.company.id = ?1 AND i.status = ?2")
    long countByCompanyIdAndStatus(Long companyId, String status);
}
