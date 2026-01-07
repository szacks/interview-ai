package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoringSettingsResponse {

    private Long id;
    private Long companyId;

    // Overall score weights
    private Double autoScoreWeight;
    private Double manualScoreWeight;

    // Individual manual score parameter weights
    private Double communicationWeight;
    private Double algorithmicWeight;
    private Double problemSolvingWeight;
    private Double aiCollaborationWeight;

    // Additional custom parameters
    private String additionalParameters;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
