package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.util.List;

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

    private List<ScoringParameterRequest> parameters;
}
