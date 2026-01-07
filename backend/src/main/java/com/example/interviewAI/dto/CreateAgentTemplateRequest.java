package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAgentTemplateRequest {
    @NotBlank(message = "Agent name is required")
    private String name;

    @NotBlank(message = "System prompt is required")
    private String systemPrompt;
}
