package com.example.interviewAI.service;

import com.example.interviewAI.dto.ChatMessageDTO;
import com.example.interviewAI.dto.ChatMessageRequest;
import com.example.interviewAI.dto.ChatMessageResponse;
import com.example.interviewAI.dto.WebSocketMessage;
import com.example.interviewAI.entity.ChatMessage;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.repository.ChatMessageRepository;
import com.example.interviewAI.repository.InterviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling chat operations during interviews
 */
@Slf4j
@Service
@Transactional
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ClaudeService claudeService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handle a candidate question and generate AI response
     * @param request The chat message request from candidate
     * @return The AI response
     */
    public ChatMessageResponse handleCandidateQuestion(ChatMessageRequest request) {
        log.info("Handling candidate question for interview {}", request.getInterviewId());

        // 1. Validate interview exists and is active
        Long interviewId = request.getInterviewId();
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> new RuntimeException("Interview not found"));

        if (!"in_progress".equals(interview.getStatus())) {
            throw new RuntimeException("Interview is not active");
        }

        // 2. Save candidate message
        ChatMessage candidateMessage = new ChatMessage();
        candidateMessage.setInterview(interview);
        candidateMessage.setRole("candidate");
        candidateMessage.setContent(request.getMessage());
        candidateMessage.setSenderName(request.getSenderName());
        candidateMessage.setTimestamp(LocalDateTime.now());
        candidateMessage = chatMessageRepository.save(candidateMessage);

        log.debug("Saved candidate message with ID: {}", candidateMessage.getId());

        // 3. Broadcast candidate message via WebSocket
        broadcastMessage(interviewId, candidateMessage);

        // 4. Get conversation history for context
        List<ChatMessage> history = chatMessageRepository
                .findByInterviewIdOrderByTimestampAsc(interviewId);

        // 5. Generate AI response using Claude
        String aiResponse = claudeService.generateChatResponse(
                interviewId,
                request.getMessage(),
                history
        );

        // 6. Save AI response
        ChatMessage aiMessage = new ChatMessage();
        aiMessage.setInterview(interview);
        aiMessage.setRole("ai");
        aiMessage.setContent(aiResponse);
        aiMessage.setSenderName("AI Assistant");
        aiMessage.setTimestamp(LocalDateTime.now());
        aiMessage = chatMessageRepository.save(aiMessage);

        log.debug("Saved AI response message with ID: {}", aiMessage.getId());

        // 7. Broadcast AI response via WebSocket
        broadcastMessage(interviewId, aiMessage);

        // 8. Return AI response to caller
        log.info("Successfully handled question and generated response for interview {}", interviewId);
        return mapToResponse(aiMessage);
    }

    /**
     * Get chat history for an interview
     * @param interviewId The interview ID
     * @return List of chat messages
     */
    public List<ChatMessageResponse> getChatHistory(Long interviewId) {
        log.info("Fetching chat history for interview {}", interviewId);

        List<ChatMessage> messages = chatMessageRepository
                .findByInterviewIdOrderByTimestampAsc(interviewId);

        log.debug("Found {} messages for interview {}", messages.size(), interviewId);

        return messages.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Broadcast a chat message to all interview participants via WebSocket
     * @param interviewId The interview ID
     * @param message The chat message to broadcast
     */
    private void broadcastMessage(Long interviewId, ChatMessage message) {
        try {
            // Create DTO for WebSocket broadcast
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.setMessage(message.getContent());
            dto.setSenderType(message.getRole());
            dto.setSenderName(message.getSenderName());
            dto.setIsRead(false);

            // Create WebSocket message wrapper
            WebSocketMessage wsMessage = new WebSocketMessage();
            wsMessage.setType("chat");
            wsMessage.setInterviewId(interviewId);
            wsMessage.setPayload(dto);
            wsMessage.setTimestamp(message.getTimestamp());

            // Send to all participants
            messagingTemplate.convertAndSend(
                    "/topic/interview/" + interviewId + "/chat",
                    wsMessage
            );

            log.debug("Broadcasted message to interview {}", interviewId);

        } catch (Exception e) {
            log.error("Error broadcasting message for interview {}", interviewId, e);
        }
    }

    /**
     * Resolve an interview link token to an interview ID
     * @param token The interview link token
     * @return The interview ID
     */
    public Long resolveInterviewToken(String token) {
        log.debug("Resolving interview token: {}", token);

        Interview interview = interviewRepository.findByInterviewLinkToken(token)
                .orElseThrow(() -> {
                    log.error("Interview not found for token: {}", token);
                    return new RuntimeException("Interview not found for token: " + token);
                });

        log.debug("Resolved token {} to interview ID {}", token, interview.getId());
        return interview.getId();
    }

    /**
     * Convert ChatMessage entity to response DTO
     */
    private ChatMessageResponse mapToResponse(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .senderName(message.getSenderName())
                .build();
    }
}
