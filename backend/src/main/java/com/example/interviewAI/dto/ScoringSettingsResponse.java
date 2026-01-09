package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoringSettingsResponse {

    private Long id;
    private Long companyId;

    // Overall score weights
    private Double autoScoreWeight;
    private Double manualScoreWeight;

    // Dynamic assessment parameters
    private List<ScoringParameterResponse> parameters;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
