package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Response containing test validation results and AI implementation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTestsWithAIResponse {

    private int passed;
    private int failed;
    private List<TestExecutionResult> results;
    private String aiImplementation;
    private String explanation;

    /**
     * Individual test execution result
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestExecutionResult {
        private String testName;
        private boolean passed;
        private String expected;
        private String actual;
        private String error;
    }
}
