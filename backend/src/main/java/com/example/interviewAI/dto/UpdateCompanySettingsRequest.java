package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompanySettingsRequest {
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
}
