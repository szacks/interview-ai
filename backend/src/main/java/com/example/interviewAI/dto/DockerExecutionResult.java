package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DockerExecutionResult {

    private boolean success;

    // Status: "success", "error", "timeout", "compilation_error"
    private String status;

    private Integer exitCode;
    private Long executionTimeMs;

    private String stdout;
    private String stderr;
    private String errorMessage;
}
