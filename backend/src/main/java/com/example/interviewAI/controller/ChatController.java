package com.example.interviewAI.controller;

import com.example.interviewAI.dto.ChatMessageRequest;
import com.example.interviewAI.dto.ChatMessageResponse;
import com.example.interviewAI.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for chat operations during interviews
 * CORS configuration is managed globally in CorsConfig.java
 */
@Slf4j
@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * POST /api/chat/message
     * Send a message from candidate and get AI response
     *
     * @param request The chat message request
     * @return The AI response message
     */
    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request) {

        log.info("Received chat message for interview {}", request.getInterviewId());

        try {
            ChatMessageResponse response = chatService.handleCandidateQuestion(request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error processing chat message: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/chat/history/{interviewId}
     * Get complete chat history for an interview
     *
     * @param interviewId The interview ID
     * @return List of all chat messages for the interview
     */
    @GetMapping("/history/{interviewId}")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @PathVariable Long interviewId) {

        log.info("Fetching chat history for interview {}", interviewId);

        try {
            List<ChatMessageResponse> history = chatService.getChatHistory(interviewId);
            return ResponseEntity.ok(history);

        } catch (RuntimeException e) {
            log.error("Error fetching chat history: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/chat/resolve-token/{token}
     * Resolve an interview link token to an interview ID
     *
     * @param token The interview link token
     * @return The interview ID
     */
    @GetMapping("/resolve-token/{token}")
    public ResponseEntity<Long> resolveToken(
            @PathVariable String token) {

        log.info("Resolving interview token: {}", token);

        try {
            Long interviewId = chatService.resolveInterviewToken(token);
            return ResponseEntity.ok(interviewId);

        } catch (RuntimeException e) {
            log.error("Error resolving token: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Health check endpoint for chat service
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is healthy");
    }
}
