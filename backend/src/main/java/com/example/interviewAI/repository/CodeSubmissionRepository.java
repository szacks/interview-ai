package com.example.interviewAI.repository;

import com.example.interviewAI.entity.CodeSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodeSubmissionRepository extends JpaRepository<CodeSubmission, Long> {
    /**
     * Get the latest code submission for an interview
     */
    @Query("SELECT cs FROM CodeSubmission cs WHERE cs.interview.id = :interviewId " +
           "ORDER BY cs.timestamp DESC LIMIT 1")
    Optional<CodeSubmission> findLatestByInterviewId(@Param("interviewId") Long interviewId);
}
