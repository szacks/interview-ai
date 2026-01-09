package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySettingsResponse {
    private Long id;
    private Long companyId;

    // Score Distribution
    private Integer autoScoreWeight;
    private Integer manualScoreWeight;

    // Data Retention (admin level)
    private Integer dataRetentionDays;

    // Session Settings (admin level)
    private Integer defaultSessionTimeoutMinutes;

    // Scoring Thresholds
    private Integer scoreExceptionalThreshold;
    private Integer scoreStrongThreshold;
    private Integer scoreGoodThreshold;
    private Integer scoreConcerningThreshold;

    // Assessment Parameters
    private List<AssessmentParameterResponse> assessmentParameters;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
