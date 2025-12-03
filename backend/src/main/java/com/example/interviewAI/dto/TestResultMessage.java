package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message payload for test execution results.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestResultMessage {

    /**
     * Test execution status: 'passed', 'failed', 'error', 'timeout'
     */
    private String status;

    /**
     * Test output/results text
     */
    private String output;

    /**
     * Execution time in milliseconds
     */
    private Long executionTime;

    /**
     * Number of tests passed
     */
    private Integer passedTests;

    /**
     * Number of tests failed
     */
    private Integer failedTests;

    /**
     * Error message if execution failed
     */
    private String errorMessage;
}
