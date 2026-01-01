package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for validating template code syntax (compilation check only, no execution)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRequest {

    @NotBlank(message = "Language is required")
    private String language; // 'java', 'python', 'javascript'

    @NotBlank(message = "Code is required")
    private String code; // Template code to validate
}
