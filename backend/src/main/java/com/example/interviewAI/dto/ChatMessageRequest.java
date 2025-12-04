package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

/**
 * DTO for incoming chat message requests from candidates
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    /**
     * ID of the interview this message belongs to
     */
    @NotNull(message = "Interview ID is required")
    @NonNull
    private Long interviewId;

    /**
     * The message content
     */
    @NotBlank(message = "Message cannot be empty")
    private String message;

    /**
     * Type of sender: typically "candidate"
     */
    @NotBlank(message = "Sender type is required")
    private String senderType;

    /**
     * Display name of the sender
     */
    private String senderName;
}
