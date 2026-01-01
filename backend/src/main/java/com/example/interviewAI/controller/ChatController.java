package com.example.interviewAI.controller;

import com.example.interviewAI.dto.ChatMessageRequest;
import com.example.interviewAI.dto.ChatMessageResponse;
import com.example.interviewAI.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for chat operations during interviews.
 * Uses constructor injection for better testability and immutability.
 */
@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * Send a message from candidate and get AI response.
     *
     * @param request the chat message request
     * @return the AI response message
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
     * Get complete chat history for an interview.
     *
     * @param interviewId the interview ID
     * @return list of all chat messages for the interview
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
     * Resolve an interview link token to an interview ID.
     *
     * @param token the interview link token
     * @return the interview ID
     */
    @GetMapping("/resolve-token/{token}")
    public ResponseEntity<Long> resolveToken(@PathVariable String token) {

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
     * Health check endpoint for chat service.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is healthy");
    }
}
