package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScoringParameterRequest {
    @NotBlank(message = "Parameter name is required")
    private String name;

    private String description;

    private Integer orderIndex = 0;
}
