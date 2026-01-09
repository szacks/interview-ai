package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssessmentParameterRequest {
    private String name;
    private String description;
    private Integer maxScore;
    private BigDecimal weight;
    private Integer displayOrder;
    private Boolean isActive;
}
