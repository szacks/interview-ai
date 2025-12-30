package com.example.interviewAI.service;

import com.example.interviewAI.dto.CodeSubmissionRequest;
import com.example.interviewAI.dto.CodeSubmissionResponse;
import com.example.interviewAI.entity.CodeSubmission;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.repository.CodeSubmissionRepository;
import com.example.interviewAI.repository.InterviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class CodeService {

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Save code submission and broadcast to interview participants
     */
    public CodeSubmissionResponse submitCode(CodeSubmissionRequest request) {
        // Validate interview exists
        Interview interview = interviewRepository.findById(request.getInterviewId())
            .orElseThrow(() -> new RuntimeException("Interview not found"));

        // Allow code submission when interview is scheduled or in_progress
        // This allows candidates to submit code both before and after the interview starts
        String status = interview.getStatus();
        if (!"scheduled".equals(status) && !"in_progress".equals(status)) {
            throw new RuntimeException("Interview is not active. Current status: " + status);
        }

        // Save code submission
        CodeSubmission submission = new CodeSubmission();
        submission.setInterview(interview);
        submission.setLanguage(request.getLanguage());
        submission.setCode(request.getCode());
        submission = codeSubmissionRepository.save(submission);

        log.info("Code submission saved - ID: {}, Interview: {}, Language: {}, Code length: {}, Status: {}",
            submission.getId(), request.getInterviewId(), request.getLanguage(),
            request.getCode().length(), status);

        // Broadcast code update via WebSocket
        broadcastCodeUpdate(request.getInterviewId(), submission);

        return mapToResponse(submission);
    }

    /**
     * Get latest code for an interview
     * Returns empty response if no code submission exists (instead of throwing 404)
     */
    public CodeSubmissionResponse getLatestCode(Long interviewId) {
        var result = codeSubmissionRepository.findLatestByInterviewId(interviewId);

        if (result.isPresent()) {
            CodeSubmission submission = result.get();
            log.info("Retrieved latest code for interview {} - Submission ID: {}, Language: {}, Code length: {}, Timestamp: {}",
                interviewId, submission.getId(), submission.getLanguage(), submission.getCode().length(), submission.getTimestamp());
            return mapToResponse(submission);
        } else {
            log.info("No code submission found for interview {}", interviewId);
            return CodeSubmissionResponse.builder().build(); // Return empty response instead of 404
        }
    }

    /**
     * Broadcast code update to all interview participants via WebSocket
     */
    private void broadcastCodeUpdate(Long interviewId, CodeSubmission submission) {
        CodeSubmissionResponse response = mapToResponse(submission);
        messagingTemplate.convertAndSend(
            "/topic/interview/" + interviewId + "/code",
            response
        );
    }

    private CodeSubmissionResponse mapToResponse(CodeSubmission submission) {
        return CodeSubmissionResponse.builder()
            .id(submission.getId())
            .language(submission.getLanguage())
            .code(submission.getCode())
            .timestamp(submission.getTimestamp())
            .build();
    }
}
