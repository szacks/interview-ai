package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionRequest {

    @NotNull(message = "Interview ID is required")
    private Long interviewId;

    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Code is required")
    private String code;
}
