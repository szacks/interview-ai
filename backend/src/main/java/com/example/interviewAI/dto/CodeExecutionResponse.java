package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeExecutionResponse {

    private Long interviewId;

    // Status: "success", "error", "timeout", "compilation_error"
    private String status;

    private Integer testsPassed;
    private Integer testsTotal;
    private Integer autoScore;
    private Long executionTimeMs;

    private List<TestCaseResult> testDetails;

    private String errorMessage;
    private String stdout;
    private String stderr;

    private LocalDateTime executedAt;
}
