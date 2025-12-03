package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * WebSocket message DTO for real-time communication between interviewer and candidate.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {

    /**
     * Message type: 'code', 'chat', 'timer', 'status', 'cursor', 'selection'
     */
    private String type;

    /**
     * Interview ID associated with this message
     */
    private Long interviewId;

    /**
     * User ID of the sender
     */
    private Long senderId;

    /**
     * Message payload (content varies by type)
     */
    private Object payload;

    /**
     * Timestamp of message creation
     */
    private LocalDateTime timestamp;
}
