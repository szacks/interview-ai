package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoringSettingsRequest {

    @NotNull(message = "Auto score weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Auto score weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Auto score weight must be between 0.0 and 1.0")
    private Double autoScoreWeight;

    @NotNull(message = "Manual score weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Manual score weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Manual score weight must be between 0.0 and 1.0")
    private Double manualScoreWeight;

    @NotNull(message = "Communication weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Communication weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Communication weight must be between 0.0 and 1.0")
    private Double communicationWeight;

    @NotNull(message = "Algorithmic weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Algorithmic weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Algorithmic weight must be between 0.0 and 1.0")
    private Double algorithmicWeight;

    @NotNull(message = "Problem solving weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Problem solving weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Problem solving weight must be between 0.0 and 1.0")
    private Double problemSolvingWeight;

    @NotNull(message = "AI collaboration weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "AI collaboration weight must be between 0.0 and 1.0")
    @DecimalMax(value = "1.0", inclusive = true, message = "AI collaboration weight must be between 0.0 and 1.0")
    private Double aiCollaborationWeight;

    // Additional custom parameters as JSON string
    private String additionalParameters;
}
