package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResponse {
    private Long id;
    private String testName;
    private String testCase;
    private String description;
    private String operationsJson;
    private String assertionsJson;
    private Integer orderIndex;
    private Boolean passed;
}
