package com.example.interviewAI.service;

import com.example.interviewAI.dto.CreateInterviewRequest;
import com.example.interviewAI.dto.InterviewResponse;
import com.example.interviewAI.dto.CompanyResponse;
import com.example.interviewAI.dto.QuestionResponse;
import com.example.interviewAI.dto.CandidateResponse;
import com.example.interviewAI.dto.UserResponse;
import com.example.interviewAI.entity.Candidate;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.repository.CandidateRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class InterviewService {

    @Autowired
    private InterviewRepository interviewRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Get all interviews for a company
     */
    public List<InterviewResponse> getInterviewsByCompany(Long companyId) {
        List<Interview> interviews = interviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        return interviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get interviews for a company filtered by status
     */
    public List<InterviewResponse> getInterviewsByCompanyAndStatus(Long companyId, String status) {
        List<Interview> interviews = interviewRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, status);
        return interviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get interviews assigned to a specific interviewer
     */
    public List<InterviewResponse> getInterviewsByInterviewer(Long interviewerId) {
        List<Interview> interviews = interviewRepository.findByInterviewerId(interviewerId);
        return interviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a single interview by ID
     */
    public InterviewResponse getInterviewById(Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found with id: " + interviewId));
        return convertToResponse(interview);
    }

    /**
     * Get interview by link token (for candidate access)
     */
    public InterviewResponse getInterviewByToken(String token) {
        Interview interview = interviewRepository.findByInterviewLinkToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired interview link"));
        return convertToResponse(interview);
    }

    /**
     * Create a new interview
     */
    @Transactional
    public InterviewResponse createInterview(Long companyId, CreateInterviewRequest request, Long createdByUserId) {
        // Validate question exists
        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        // Get or create candidate
        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        // Get interviewer (use provided or the creating user)
        Long interviewerId = request.getInterviewerId() != null ? request.getInterviewerId() : createdByUserId;
        User interviewer = userRepository.findById(interviewerId)
                .orElseThrow(() -> new IllegalArgumentException("Interviewer not found"));

        // Create interview
        Interview interview = new Interview();
        interview.setQuestion(question);
        interview.setCandidate(candidate);
        interview.setInterviewer(interviewer);
        interview.setLanguage(request.getLanguage());
        interview.setStatus("scheduled");
        interview.setScheduledAt(request.getScheduledAt());
        interview.setCreatedAt(LocalDateTime.now());
        interview.setInterviewLinkToken(generateUniqueToken());

        // Get company from interviewer
        interview.setCompany(interviewer.getCompany());

        interview = interviewRepository.save(interview);

        // Send interview scheduled email to candidate
        try {
            String interviewLink = buildInterviewLink(interview.getInterviewLinkToken());
            String scheduledTime = interview.getScheduledAt() != null ? interview.getScheduledAt().toString() : "To be determined";
            emailService.sendInterviewScheduledEmail(
                    candidate.getEmail(),
                    candidate.getName(),
                    interviewer.getCompany().getName(),
                    question.getTitle(),
                    interviewLink,
                    scheduledTime
            );
        } catch (Exception e) {
            log.error("Error sending interview scheduled email: {}", e.getMessage());
            // Don't throw - interview was created successfully
        }

        return convertToResponse(interview);
    }

    /**
     * Update interview status
     */
    @Transactional
    public InterviewResponse updateInterviewStatus(Long interviewId, String newStatus) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        interview.setStatus(newStatus);

        if ("in_progress".equals(newStatus)) {
            interview.setStartedAt(LocalDateTime.now());
        } else if ("completed".equals(newStatus)) {
            interview.setCompletedAt(LocalDateTime.now());
        }

        interview = interviewRepository.save(interview);
        return convertToResponse(interview);
    }

    /**
     * Start an interview session
     */
    @Transactional
    public InterviewResponse startInterview(Long interviewId) {
        return updateInterviewStatus(interviewId, "in_progress");
    }

    /**
     * Complete an interview
     */
    @Transactional
    public InterviewResponse completeInterview(Long interviewId) {
        return updateInterviewStatus(interviewId, "completed");
    }

    /**
     * Get count of interviews by status for a company
     */
    public long getInterviewCountByStatus(Long companyId, String status) {
        return interviewRepository.countByCompanyIdAndStatus(companyId, status);
    }

    /**
     * Convert Interview entity to InterviewResponse DTO
     */
    private InterviewResponse convertToResponse(Interview interview) {
        InterviewResponse response = new InterviewResponse();
        response.setId(interview.getId());
        response.setCompanyId(interview.getCompany() != null ? interview.getCompany().getId() : null);
        response.setQuestionId(interview.getQuestion() != null ? interview.getQuestion().getId() : null);
        response.setCandidateId(interview.getCandidate() != null ? interview.getCandidate().getId() : null);
        response.setInterviewerId(interview.getInterviewer() != null ? interview.getInterviewer().getId() : null);
        response.setLanguage(interview.getLanguage());
        response.setStatus(interview.getStatus());
        response.setScheduledAt(interview.getScheduledAt());
        response.setStartedAt(interview.getStartedAt());
        response.setCompletedAt(interview.getCompletedAt());
        response.setInterviewLinkToken(interview.getInterviewLinkToken());
        response.setCreatedAt(interview.getCreatedAt());

        // Map company
        if (interview.getCompany() != null) {
            CompanyResponse companyResponse = new CompanyResponse();
            companyResponse.setId(interview.getCompany().getId());
            companyResponse.setName(interview.getCompany().getName());
            companyResponse.setEmail(interview.getCompany().getEmail());
            companyResponse.setSubscriptionTier(interview.getCompany().getSubscriptionTier());
            companyResponse.setLogoUrl(interview.getCompany().getLogoUrl());
            companyResponse.setCreatedAt(interview.getCompany().getCreatedAt());
            companyResponse.setUpdatedAt(interview.getCompany().getUpdatedAt());
            response.setCompany(companyResponse);
        }

        // Map question
        if (interview.getQuestion() != null) {
            QuestionResponse questionResponse = new QuestionResponse();
            questionResponse.setId(interview.getQuestion().getId());
            questionResponse.setTitle(interview.getQuestion().getTitle());
            questionResponse.setDescription(interview.getQuestion().getDescription());
            questionResponse.setDifficulty(interview.getQuestion().getDifficulty());
            questionResponse.setTimeLimitMinutes(interview.getQuestion().getTimeLimitMinutes());
            questionResponse.setSupportedLanguages(interview.getQuestion().getSupportedLanguages());
            questionResponse.setRequirementsJson(interview.getQuestion().getRequirementsJson());
            questionResponse.setTestsJson(interview.getQuestion().getTestsJson());
            questionResponse.setRubricJson(interview.getQuestion().getRubricJson());
            questionResponse.setIntentionalBugsJson(interview.getQuestion().getIntentionalBugsJson());
            questionResponse.setInitialCodeJava(interview.getQuestion().getInitialCodeJava());
            questionResponse.setInitialCodePython(interview.getQuestion().getInitialCodePython());
            questionResponse.setInitialCodeJavascript(interview.getQuestion().getInitialCodeJavascript());
            questionResponse.setCreatedAt(interview.getQuestion().getCreatedAt());
            response.setQuestion(questionResponse);
        }

        return response;
    }

    /**
     * Generate unique token for interview link
     */
    private String generateUniqueToken() {
        return UUID.randomUUID().toString();
    }

    /**
     * Build interview link for candidate access
     */
    private String buildInterviewLink(String interviewToken) {
        return frontendUrl + "/interview/" + interviewToken;
    }
}
