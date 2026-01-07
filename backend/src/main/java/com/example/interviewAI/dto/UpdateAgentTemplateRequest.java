package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAgentTemplateRequest {
    private String name;
    private String description;
    private String systemPrompt;
}
