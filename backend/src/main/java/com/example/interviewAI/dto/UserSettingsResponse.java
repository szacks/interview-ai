package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsResponse {
    private Long id;
    private Long userId;
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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
