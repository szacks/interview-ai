package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResult {

    private Long testCaseId;
    private String testName;
    private Boolean passed;
    private String expected;
    private String actual;
    private String errorMessage;
    private Long executionTimeMs;
}
