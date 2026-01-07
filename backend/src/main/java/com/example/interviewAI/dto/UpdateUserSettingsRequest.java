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
    private Integer autoScoreWeight;
}
