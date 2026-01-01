package com.example.interviewAI.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Request for validating test cases by generating AI implementation and running tests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateTestsWithAIRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Primary language is required")
    private String primaryLanguage; // 'java', 'python', 'javascript'

    @NotBlank(message = "Code template is required")
    private String codeTemplate;

    @NotEmpty(message = "At least one test case is required")
    private List<TestCaseDefinition> tests;

    /**
     * Test case definition
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseDefinition {
        private String id;
        private String name;
        private String description;
        private String setup;
        private String input;
        private String expectedOutput;
        private Boolean visibleToCandidate;
        private Integer timeout;
    }
}
