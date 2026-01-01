package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for AI chat testing endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AITestResponse {
    private String message;
    private Boolean success;
    private String error;
}
