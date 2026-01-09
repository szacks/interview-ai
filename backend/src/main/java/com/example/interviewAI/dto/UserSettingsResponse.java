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
    private Integer autoScoreWeight;
    private Integer sessionTimeoutMinutes;
    private Integer dataRetentionDays;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
