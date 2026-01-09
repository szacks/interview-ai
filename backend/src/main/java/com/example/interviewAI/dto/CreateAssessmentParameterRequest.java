package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAssessmentParameterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @Positive(message = "Max score must be positive")
    private Integer maxScore = 5;

    @Positive(message = "Weight must be positive")
    private BigDecimal weight = BigDecimal.ONE;

    private Integer displayOrder = 0;
}
