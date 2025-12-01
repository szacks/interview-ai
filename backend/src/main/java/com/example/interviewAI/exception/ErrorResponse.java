package com.example.interviewAI.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standardized error response structure for all API errors.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    /**
     * Timestamp when the error occurred
     */
    private LocalDateTime timestamp;

    /**
     * HTTP status code
     */
    private int status;

    /**
     * Error type (e.g., "Bad Request", "Not Found")
     */
    private String error;

    /**
     * Main error message
     */
    private String message;

    /**
     * Detailed error description (optional)
     */
    private String details;

    /**
     * Path that caused the error
     */
    private String path;

    /**
     * List of validation errors (for field-specific errors)
     */
    private List<FieldError> fieldErrors;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
        private Object rejectedValue;
    }
}
