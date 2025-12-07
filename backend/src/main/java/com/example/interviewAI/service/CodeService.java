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

        if (!"in_progress".equals(interview.getStatus())) {
            throw new RuntimeException("Interview is not active");
        }

        // Save code submission
        CodeSubmission submission = new CodeSubmission();
        submission.setInterview(interview);
        submission.setLanguage(request.getLanguage());
        submission.setCode(request.getCode());
        submission = codeSubmissionRepository.save(submission);

        log.info("Code submission saved for interview {} in {}", request.getInterviewId(), request.getLanguage());

        // Broadcast code update via WebSocket
        broadcastCodeUpdate(request.getInterviewId(), submission);

        return mapToResponse(submission);
    }

    /**
     * Get latest code for an interview
     */
    public CodeSubmissionResponse getLatestCode(Long interviewId) {
        return codeSubmissionRepository.findLatestByInterviewId(interviewId)
            .map(this::mapToResponse)
            .orElseThrow(() -> new RuntimeException("No code submission found for interview"));
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
