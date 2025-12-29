package com.example.interviewAI.controller;

import com.example.interviewAI.dto.EvaluationRequest;
import com.example.interviewAI.dto.EvaluationResponse;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.entity.InterviewEvaluation;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.exception.ForbiddenException;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.repository.CodeExecutionRepository;
import com.example.interviewAI.repository.InterviewEvaluationRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.entity.CodeExecution;
import com.example.interviewAI.security.JwtTokenProvider;
import com.example.interviewAI.service.ScoringService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.interviewAI.service.PdfExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for interview evaluation/scoring operations.
 * Handles the new scoring system with 4 manual parameters.
 */
@Slf4j
@RestController
@RequestMapping("/interview-evaluations")
@RequiredArgsConstructor
public class InterviewEvaluationController {

    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewRepository interviewRepository;
    private final CodeExecutionRepository codeExecutionRepository;
    private final ScoringService scoringService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Autowired
    private PdfExportService pdfExportService;

    /**
     * Submit or update an evaluation for an interview.
     */
    @PostMapping
    public ResponseEntity<EvaluationResponse> submitEvaluation(
            @Valid @RequestBody EvaluationRequest request,
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Submitting evaluation for interview: {}", request.getInterviewId());

        // Authorization is optional for now (for testing)
        if (bearerToken != null && !bearerToken.isEmpty()) {
            try {
                User user = extractUserFromToken(bearerToken);
                // Authorization: Admin or Interviewer
                if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
                    throw new ForbiddenException("You are not authorized to submit evaluations");
                }
            } catch (Exception e) {
                log.debug("Could not extract user from token, allowing anonymous access for testing");
            }
        }

        // Get interview
        Interview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", request.getInterviewId()));

        // Get or create evaluation
        InterviewEvaluation evaluation = evaluationRepository.findByInterviewId(request.getInterviewId())
                .orElse(new InterviewEvaluation());

        // Set interview if new
        if (evaluation.getId() == null) {
            evaluation.setInterview(interview);
            evaluation.setCreatedAt(LocalDateTime.now());
            // Fetch real test results from code execution
            Optional<CodeExecution> latestExecution = codeExecutionRepository.findLatestByInterviewId(interview.getId());
            if (latestExecution.isPresent()) {
                CodeExecution execution = latestExecution.get();
                evaluation.setTestsPassed(execution.getTestsPassed() != null ? execution.getTestsPassed() : 0);
                evaluation.setTestsTotal(execution.getTestsTotal() != null ? execution.getTestsTotal() : 0);
                evaluation.setAutoScoreOriginal(execution.getAutoScore() != null ? execution.getAutoScore() : 0);
            } else {
                // No test execution found - use placeholder
                evaluation.setTestsPassed(0);
                evaluation.setTestsTotal(0);
                evaluation.setAutoScoreOriginal(0);
            }
        }

        // Update fields
        evaluation.setAutoScoreAdjusted(request.getAutoScoreAdjusted());
        evaluation.setAutoScoreAdjustedReason(request.getAutoScoreAdjustedReason());
        evaluation.setManualScoreCommunication(request.getManualScoreCommunication());
        evaluation.setManualScoreAlgorithmic(request.getManualScoreAlgorithmic());
        evaluation.setManualScoreProblemSolving(request.getManualScoreProblemSolving());
        evaluation.setManualScoreAiCollaboration(request.getManualScoreAiCollaboration());
        evaluation.setNotesCommunication(request.getNotesCommunication());
        evaluation.setNotesAlgorithmic(request.getNotesAlgorithmic());
        evaluation.setNotesProblemSolving(request.getNotesProblemSolving());
        evaluation.setNotesAiCollaboration(request.getNotesAiCollaboration());
        evaluation.setCustomObservations(request.getCustomObservations());

        // Calculate scores
        int autoScore = scoringService.getEffectiveAutoScore(
                evaluation.getAutoScoreOriginal(),
                evaluation.getAutoScoreAdjusted()
        );
        int manualScore = scoringService.calculateManualScore(
                request.getManualScoreCommunication(),
                request.getManualScoreAlgorithmic(),
                request.getManualScoreProblemSolving(),
                request.getManualScoreAiCollaboration()
        );
        int finalScore = scoringService.calculateFinalScore(autoScore, manualScore);
        evaluation.setFinalScore(finalScore);

        // Handle draft vs submit
        boolean isDraft = request.getIsDraft() != null && request.getIsDraft();
        evaluation.setIsDraft(isDraft);
        if (!isDraft) {
            evaluation.setEvaluationSubmittedAt(LocalDateTime.now());
        }

        evaluation.setUpdatedAt(LocalDateTime.now());
        InterviewEvaluation saved = evaluationRepository.save(evaluation);

        log.info("Evaluation {} for interview {}: autoScore={}, manualScore={}, finalScore={}",
                isDraft ? "saved as draft" : "submitted",
                request.getInterviewId(), autoScore, manualScore, finalScore);

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved, interview));
    }

    /**
     * Get evaluation for an interview.
     */
    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<EvaluationResponse> getEvaluation(
            @PathVariable Long interviewId,
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.debug("Fetching evaluation for interview: {}", interviewId);

        // Authorization is optional for now (for testing)
        // In production, this should require authentication
        if (bearerToken != null && !bearerToken.isEmpty()) {
            try {
                User user = extractUserFromToken(bearerToken);
                // Authorization: Admin or Interviewer
                if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
                    throw new ForbiddenException("You are not authorized to view evaluations");
                }
            } catch (Exception e) {
                log.debug("Could not extract user from token, allowing anonymous access for testing");
            }
        }

        // Get interview
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        // Get evaluation if exists
        InterviewEvaluation evaluation = evaluationRepository.findByInterviewId(interviewId)
                .orElse(null);

        // If no evaluation exists, return a skeleton response with interview data
        if (evaluation == null) {
            EvaluationResponse response = createSkeletonResponse(interview);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.ok(toResponse(evaluation, interview));
    }

    /**
     * Delete an evaluation.
     */
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Map<String, String>> deleteEvaluation(
            @PathVariable Long evaluationId,
            @RequestHeader("Authorization") String bearerToken) {
        log.info("Deleting evaluation with ID: {}", evaluationId);
        User user = extractUserFromToken(bearerToken);

        // Authorization: Admin only
        if (!user.getRole().equals(RoleEnum.ADMIN)) {
            throw new ForbiddenException("You are not authorized to delete evaluations");
        }

        InterviewEvaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation", "id", evaluationId));

        evaluationRepository.delete(evaluation);

        return ResponseEntity.ok(Map.of("message", "Evaluation deleted successfully"));
    }

    /**
     * Export evaluation as PDF.
     */
    @GetMapping("/export/pdf/{interviewId}")
    public ResponseEntity<byte[]> exportEvaluationAsPdf(
            @PathVariable Long interviewId,
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        log.info("Exporting evaluation as PDF for interview: {}", interviewId);

        // Authorization is optional for now (for testing)
        if (bearerToken != null && !bearerToken.isEmpty()) {
            try {
                User user = extractUserFromToken(bearerToken);
                // Authorization: Admin or Interviewer
                if (!user.getRole().equals(RoleEnum.ADMIN) && !user.getRole().equals(RoleEnum.INTERVIEWER)) {
                    throw new ForbiddenException("You are not authorized to export evaluations");
                }
            } catch (Exception e) {
                log.debug("Could not extract user from token, allowing anonymous access for testing");
            }
        }

        // Get interview
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", "id", interviewId));

        // Get evaluation if exists
        InterviewEvaluation evaluation = evaluationRepository.findByInterviewId(interviewId)
                .orElse(null);

        // Create response with evaluation data
        EvaluationResponse response;
        if (evaluation == null) {
            response = createSkeletonResponse(interview);
        } else {
            response = toResponse(evaluation, interview);
        }

        // Generate PDF
        byte[] pdfContent = pdfExportService.generateEvaluationPdf(response);

        // Return PDF with appropriate headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment",
            "interview_evaluation_" + interviewId + ".pdf");
        headers.setContentLength(pdfContent.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }

    /**
     * Convert entity to response DTO.
     */
    private EvaluationResponse toResponse(InterviewEvaluation evaluation, Interview interview) {
        EvaluationResponse response = new EvaluationResponse();
        response.setId(evaluation.getId());
        response.setInterviewId(interview.getId());

        // Auto score
        response.setTestsPassed(evaluation.getTestsPassed());
        response.setTestsTotal(evaluation.getTestsTotal());
        response.setAutoScoreOriginal(evaluation.getAutoScoreOriginal());
        response.setAutoScoreAdjusted(evaluation.getAutoScoreAdjusted());
        response.setAutoScoreAdjustedReason(evaluation.getAutoScoreAdjustedReason());

        // Manual scores
        response.setManualScoreCommunication(evaluation.getManualScoreCommunication());
        response.setManualScoreAlgorithmic(evaluation.getManualScoreAlgorithmic());
        response.setManualScoreProblemSolving(evaluation.getManualScoreProblemSolving());
        response.setManualScoreAiCollaboration(evaluation.getManualScoreAiCollaboration());

        // Notes
        response.setNotesCommunication(evaluation.getNotesCommunication());
        response.setNotesAlgorithmic(evaluation.getNotesAlgorithmic());
        response.setNotesProblemSolving(evaluation.getNotesProblemSolving());
        response.setNotesAiCollaboration(evaluation.getNotesAiCollaboration());
        response.setCustomObservations(evaluation.getCustomObservations());

        // Calculated scores
        int manualTotal = scoringService.calculateManualScoreTotal(
                evaluation.getManualScoreCommunication(),
                evaluation.getManualScoreAlgorithmic(),
                evaluation.getManualScoreProblemSolving(),
                evaluation.getManualScoreAiCollaboration()
        );
        int manualNormalized = scoringService.calculateManualScore(
                evaluation.getManualScoreCommunication(),
                evaluation.getManualScoreAlgorithmic(),
                evaluation.getManualScoreProblemSolving(),
                evaluation.getManualScoreAiCollaboration()
        );
        response.setManualScoreTotal(manualTotal);
        response.setManualScoreNormalized(manualNormalized);
        response.setFinalScore(evaluation.getFinalScore());

        // Status
        response.setIsDraft(evaluation.getIsDraft());
        response.setEvaluationSubmittedAt(evaluation.getEvaluationSubmittedAt());
        response.setCreatedAt(evaluation.getCreatedAt());
        response.setUpdatedAt(evaluation.getUpdatedAt());

        // Interview details
        response.setCandidateName(interview.getCandidate() != null ? interview.getCandidate().getName() : null);
        response.setQuestionTitle(interview.getQuestion() != null ? interview.getQuestion().getTitle() : null);
        response.setLanguage(interview.getLanguage());
        response.setInterviewStatus(interview.getStatus());

        // Calculate duration
        if (interview.getStartedAt() != null && interview.getCompletedAt() != null) {
            long minutes = Duration.between(interview.getStartedAt(), interview.getCompletedAt()).toMinutes();
            response.setDuration((int) minutes);
        }

        return response;
    }

    /**
     * Create a skeleton response for when no evaluation exists yet.
     */
    private EvaluationResponse createSkeletonResponse(Interview interview) {
        EvaluationResponse response = new EvaluationResponse();
        response.setInterviewId(interview.getId());

        // Fetch real test results from code execution
        Optional<CodeExecution> latestExecution = codeExecutionRepository.findLatestByInterviewId(interview.getId());
        if (latestExecution.isPresent()) {
            CodeExecution execution = latestExecution.get();
            response.setTestsPassed(execution.getTestsPassed() != null ? execution.getTestsPassed() : 0);
            response.setTestsTotal(execution.getTestsTotal() != null ? execution.getTestsTotal() : 0);
            response.setAutoScoreOriginal(execution.getAutoScore() != null ? execution.getAutoScore() : 0);
        } else {
            // No test execution found - use placeholder
            response.setTestsPassed(0);
            response.setTestsTotal(0);
            response.setAutoScoreOriginal(0);
        }

        // Interview details
        response.setCandidateName(interview.getCandidate() != null ? interview.getCandidate().getName() : null);
        response.setQuestionTitle(interview.getQuestion() != null ? interview.getQuestion().getTitle() : null);
        response.setLanguage(interview.getLanguage());
        response.setInterviewStatus(interview.getStatus());

        // Calculate duration
        if (interview.getStartedAt() != null && interview.getCompletedAt() != null) {
            long minutes = Duration.between(interview.getStartedAt(), interview.getCompletedAt()).toMinutes();
            response.setDuration((int) minutes);
        }

        response.setIsDraft(true);

        return response;
    }

    /**
     * Extract user from JWT token.
     */
    private User extractUserFromToken(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid token format");
        }

        String token = bearerToken.replace("Bearer ", "");
        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
