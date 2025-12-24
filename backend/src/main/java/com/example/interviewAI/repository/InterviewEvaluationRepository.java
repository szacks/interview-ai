package com.example.interviewAI.repository;

import com.example.interviewAI.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InterviewEvaluationRepository extends JpaRepository<InterviewEvaluation, Long> {
    Optional<InterviewEvaluation> findByInterviewId(Long interviewId);
    boolean existsByInterviewId(Long interviewId);
}
