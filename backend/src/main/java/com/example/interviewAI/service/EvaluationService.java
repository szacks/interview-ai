package com.example.interviewAI.service;

import com.example.interviewAI.dto.EvaluationResultDto;
import com.example.interviewAI.entity.Evaluation;
import com.example.interviewAI.entity.InterviewSession;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.EvaluationRepository;
import com.example.interviewAI.repository.InterviewSessionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
public class EvaluationService {

    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    @Autowired
    private ClaudeService claudeService;

    /**
     * Generate AI-powered evaluation for an interview session
     */
    @Transactional
    public Evaluation generateAIEvaluation(Long interviewSessionId) {
        try {
            log.info("Starting AI evaluation generation for interview session: {}", interviewSessionId);

            // Fetch interview session
            Optional<InterviewSession> sessionOpt = interviewSessionRepository.findById(interviewSessionId);
            if (sessionOpt.isEmpty()) {
                log.warn("Interview session not found: {}", interviewSessionId);
                return null;
            }

            InterviewSession session = sessionOpt.get();

            // Check if evaluation already exists
            Optional<Evaluation> existingEvaluation = evaluationRepository.findByInterviewSessionId(interviewSessionId);
            if (existingEvaluation.isPresent()) {
                log.info("Evaluation already exists for session: {}", interviewSessionId);
                return existingEvaluation.get();
            }

            // Get interview and question details
            Question question = session.getInterview().getQuestion();
            String candidateName = session.getInterview().getCandidate().getName();

            // Call Claude service for evaluation
            EvaluationResultDto evaluationResult = claudeService.evaluateCode(
                    candidateName,
                    question.getTitle(),
                    question.getDescription(),
                    question.getRequirementsJson(),
                    session.getCodeSnapshot() != null ? session.getCodeSnapshot() : "",
                    session.getTestResults() != null ? session.getTestResults() : ""
            );

            // Create and save Evaluation entity
            Evaluation evaluation = new Evaluation();
            evaluation.setInterviewSession(session);
            evaluation.setUnderstandingScore(evaluationResult.getUnderstandingScore());
            evaluation.setProblemSolvingScore(evaluationResult.getProblemSolvingScore());
            evaluation.setAiCollaborationScore(evaluationResult.getAiCollaborationScore());
            evaluation.setCommunicationScore(evaluationResult.getCommunicationScore());
            evaluation.setStrengths(evaluationResult.getStrengths());
            evaluation.setWeaknesses(evaluationResult.getWeaknesses());

            Evaluation savedEvaluation = evaluationRepository.save(evaluation);
            log.info("AI evaluation generated and saved successfully for session: {} with scores - " +
                    "Understanding: {}, ProblemSolving: {}, AICollaboration: {}, Communication: {}",
                    interviewSessionId, savedEvaluation.getUnderstandingScore(),
                    savedEvaluation.getProblemSolvingScore(), savedEvaluation.getAiCollaborationScore(),
                    savedEvaluation.getCommunicationScore());

            return savedEvaluation;

        } catch (Exception e) {
            log.error("Error generating AI evaluation for session: {}", interviewSessionId, e);
            // Return null instead of throwing to allow graceful degradation
            return null;
        }
    }

    /**
     * Get evaluation for an interview session
     */
    public Evaluation getEvaluation(Long interviewSessionId) {
        return evaluationRepository.findByInterviewSessionId(interviewSessionId).orElse(null);
    }

    /**
     * Update evaluation with manual scores and notes
     */
    @Transactional
    public Evaluation updateEvaluation(Long evaluationId, Integer manualScore, String interviewerNotes, String recommendation) {
        try {
            Optional<Evaluation> evaluationOpt = evaluationRepository.findById(evaluationId);
            if (evaluationOpt.isEmpty()) {
                log.warn("Evaluation not found: {}", evaluationId);
                return null;
            }

            Evaluation evaluation = evaluationOpt.get();

            // Update interviewer notes and recommendation on the interview session
            if (evaluation.getInterviewSession() != null) {
                evaluation.getInterviewSession().setInterviewerNotes(interviewerNotes);
                evaluation.getInterviewSession().setRecommendation(recommendation);
                evaluation.getInterviewSession().setManualScore(manualScore);
            }

            Evaluation updatedEvaluation = evaluationRepository.save(evaluation);
            log.info("Evaluation updated successfully: {}", evaluationId);
            return updatedEvaluation;

        } catch (Exception e) {
            log.error("Error updating evaluation: {}", evaluationId, e);
            return null;
        }
    }

    /**
     * Delete evaluation for an interview session
     */
    @Transactional
    public boolean deleteEvaluation(Long evaluationId) {
        try {
            evaluationRepository.deleteById(evaluationId);
            log.info("Evaluation deleted successfully: {}", evaluationId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting evaluation: {}", evaluationId, e);
            return false;
        }
    }
}
