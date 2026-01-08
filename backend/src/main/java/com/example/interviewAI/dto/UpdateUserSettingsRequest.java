package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserSettingsRequest {
    private Long defaultAgentId;
    private Boolean showRunTests;

    /**
     * @deprecated Use company settings API instead - /company-settings
     */
    @Deprecated
    private Integer autoScoreWeight;

    private Integer sessionTimeoutMinutes;

    /**
     * @deprecated Use company settings API instead - /company-settings
     */
    @Deprecated
    private Integer dataRetentionDays;
}
