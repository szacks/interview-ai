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
           "ORDER BY cs.timestamp DESC")
    java.util.List<CodeSubmission> findByInterviewIdOrderByTimestampDesc(@Param("interviewId") Long interviewId);

    default Optional<CodeSubmission> findLatestByInterviewId(Long interviewId) {
        java.util.List<CodeSubmission> submissions = findByInterviewIdOrderByTimestampDesc(interviewId);
        return submissions.isEmpty() ? Optional.empty() : Optional.of(submissions.get(0));
    }
}
