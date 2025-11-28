package com.example.interviewAI.repository;

import com.example.interviewAI.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByInterviewSessionId(Long interviewSessionId);

    @Query("SELECT e FROM Evaluation e WHERE e.interviewSession.interview.company.id = ?1 ORDER BY e.createdAt DESC")
    List<Evaluation> findByCompanyId(Long companyId);

    @Query("SELECT e FROM Evaluation e WHERE e.interviewSession.interview.id = ?1")
    List<Evaluation> findByInterviewId(Long interviewId);

    @Query("SELECT AVG(e.understandingScore) FROM Evaluation e WHERE e.interviewSession.interview.id = ?1")
    Double getAverageUnderstandingScore(Long interviewId);

    @Query("SELECT AVG(e.problemSolvingScore) FROM Evaluation e WHERE e.interviewSession.interview.id = ?1")
    Double getAverageProblemSolvingScore(Long interviewId);

    @Query("SELECT AVG(e.aiCollaborationScore) FROM Evaluation e WHERE e.interviewSession.interview.id = ?1")
    Double getAverageAiCollaborationScore(Long interviewId);

    @Query("SELECT AVG(e.communicationScore) FROM Evaluation e WHERE e.interviewSession.interview.id = ?1")
    Double getAverageCommunicationScore(Long interviewId);
}
