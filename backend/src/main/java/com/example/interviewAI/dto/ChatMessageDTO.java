package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message payload for chat events during interview.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    /**
     * Chat message content
     */
    private String message;

    /**
     * Sender type: 'candidate' or 'interviewer'
     */
    private String senderType;

    /**
     * Sender's name for display
     */
    private String senderName;

    /**
     * Whether message was read by the other party
     */
    private Boolean isRead;
}
