package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CodeExecutionRequest;
import com.example.interviewAI.dto.CodeExecutionResponse;
import com.example.interviewAI.dto.CodeSubmissionRequest;
import com.example.interviewAI.dto.CodeSubmissionResponse;
import com.example.interviewAI.entity.CodeExecution;
import com.example.interviewAI.repository.CodeExecutionRepository;
import com.example.interviewAI.service.CodeExecutionService;
import com.example.interviewAI.service.CodeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for code submission operations.
 * Uses constructor injection for better testability.
 */
@Slf4j
@RestController
@RequestMapping("/code")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;
    private final CodeExecutionService codeExecutionService;
    private final CodeExecutionRepository codeExecutionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Submit candidate code and broadcast to interviewer.
     *
     * @param request the code submission request
     * @return the saved code submission
     */
    @PostMapping("/submit")
    public ResponseEntity<CodeSubmissionResponse> submitCode(
            @Valid @RequestBody CodeSubmissionRequest request) {

        log.info("Code submission received for interview {}", request.getInterviewId());

        try {
            CodeSubmissionResponse response = codeService.submitCode(request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error submitting code: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get the latest code submission for an interview.
     *
     * @param interviewId the interview ID
     * @return the latest code submission
     */
    @GetMapping("/latest/{interviewId}")
    public ResponseEntity<CodeSubmissionResponse> getLatestCode(
            @PathVariable Long interviewId) {

        log.info("Fetching latest code for interview {}", interviewId);

        CodeSubmissionResponse response = codeService.getLatestCode(interviewId);
        // Returns 200 OK even if no previous code exists - frontend will use template code
        return ResponseEntity.ok(response);
    }

    /**
     * Execute code in Docker sandbox and run tests.
     *
     * @param request the code execution request containing interviewId, language, and code
     * @return the execution results with test outcomes and auto score
     */
    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(
            @Valid @RequestBody CodeExecutionRequest request) {

        log.info("Code execution requested for interview {}", request.getInterviewId());

        try {
            CodeExecutionResponse response = codeExecutionService.executeCode(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid execution request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    CodeExecutionResponse.builder()
                            .interviewId(request.getInterviewId())
                            .status("error")
                            .errorMessage(e.getMessage())
                            .build()
            );
        } catch (Exception e) {
            log.error("Error executing code", e);
            return ResponseEntity.internalServerError().body(
                    CodeExecutionResponse.builder()
                            .interviewId(request.getInterviewId())
                            .status("error")
                            .errorMessage("Internal server error")
                            .build()
            );
        }
    }

    /**
     * Get the latest code execution result for an interview.
     *
     * @param interviewId the interview ID
     * @return the latest code execution result
     */
    @GetMapping("/execution/{interviewId}")
    public ResponseEntity<CodeExecutionResponse> getLatestExecution(
            @PathVariable Long interviewId) {

        log.info("Fetching latest code execution for interview {}", interviewId);

        Optional<CodeExecution> execution = codeExecutionRepository.findLatestByInterviewId(interviewId);

        if (execution.isEmpty()) {
            log.debug("No code execution found for interview {}", interviewId);
            return ResponseEntity.ok(CodeExecutionResponse.builder()
                    .interviewId(interviewId)
                    .status("no_execution")
                    .build());
        }

        CodeExecution codeExecution = execution.get();
        CodeExecutionResponse response = CodeExecutionResponse.builder()
                .interviewId(interviewId)
                .status(codeExecution.getStatus())
                .testsPassed(codeExecution.getTestsPassed())
                .testsTotal(codeExecution.getTestsTotal())
                .autoScore(codeExecution.getAutoScore())
                .executionTimeMs(codeExecution.getExecutionTimeMs())
                .errorMessage(codeExecution.getErrorMessage())
                .stdout(codeExecution.getStdout())
                .stderr(codeExecution.getStderr())
                .executedAt(codeExecution.getExecutedAt())
                .build();

        // Parse test details if available
        if (codeExecution.getTestDetails() != null) {
            try {
                @SuppressWarnings("unchecked")
                List<com.example.interviewAI.dto.TestCaseResult> testDetails =
                    (List<com.example.interviewAI.dto.TestCaseResult>) objectMapper.readValue(
                        codeExecution.getTestDetails(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, com.example.interviewAI.dto.TestCaseResult.class)
                    );
                response.setTestDetails(testDetails);
            } catch (Exception e) {
                log.warn("Failed to parse test details for interview {}", interviewId, e);
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Delete all code executions for an interview (for testing/simulation purposes).
     *
     * @param interviewId the interview ID
     * @return success message
     */
    @DeleteMapping("/execution/{interviewId}")
    public ResponseEntity<String> deleteExecutions(@PathVariable Long interviewId) {

        log.info("Deleting code executions for interview {}", interviewId);

        try {
            List<CodeExecution> executions =
                    codeExecutionRepository.findByInterviewIdOrderByExecutedAtDesc(interviewId);

            if (executions.isEmpty()) {
                return ResponseEntity.ok("No executions found for interview " + interviewId);
            }

            codeExecutionRepository.deleteAll(executions);
            log.info("Deleted {} code executions for interview {}", executions.size(), interviewId);

            return ResponseEntity.ok("Deleted " + executions.size() + " code execution(s) for interview " + interviewId);
        } catch (Exception e) {
            log.error("Error deleting executions for interview {}", interviewId, e);
            return ResponseEntity.internalServerError().body("Error deleting executions: " + e.getMessage());
        }
    }
}
