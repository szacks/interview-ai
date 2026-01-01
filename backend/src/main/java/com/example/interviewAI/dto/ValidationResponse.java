package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for question validation endpoints.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationResponse {
    private Boolean success;
    private Boolean hasErrors;
    private String message;
    private Long questionId;
    private Boolean codeTemplatesPresent;

    // For syntax/compilation validation
    private String language;
    private String errors;
    private String warnings;
}
