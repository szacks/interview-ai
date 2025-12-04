package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for chat message responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    /**
     * Message ID
     */
    private Long id;

    /**
     * Role of the sender: "candidate", "ai", or "system"
     */
    private String role;

    /**
     * Message content
     */
    private String content;

    /**
     * Timestamp when message was created
     */
    private LocalDateTime timestamp;

    /**
     * Display name of the sender
     */
    private String senderName;
}
