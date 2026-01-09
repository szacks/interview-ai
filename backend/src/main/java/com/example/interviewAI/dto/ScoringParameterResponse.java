package com.example.interviewAI.dto;

import lombok.Data;

@Data
public class ScoringParameterResponse {
    private Long id;
    private String name;
    private String description;
    private Integer orderIndex;
    private Boolean isDefault;
}
