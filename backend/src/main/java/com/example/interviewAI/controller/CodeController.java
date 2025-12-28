package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CodeExecutionRequest;
import com.example.interviewAI.dto.CodeExecutionResponse;
import com.example.interviewAI.dto.CodeSubmissionRequest;
import com.example.interviewAI.dto.CodeSubmissionResponse;
import com.example.interviewAI.service.CodeExecutionService;
import com.example.interviewAI.service.CodeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for code submission operations
 */
@Slf4j
@RestController
@RequestMapping("/code")
public class CodeController {

    @Autowired
    private CodeService codeService;

    @Autowired
    private CodeExecutionService codeExecutionService;

    /**
     * POST /api/code/submit
     * Submit candidate code and broadcast to interviewer
     *
     * @param request The code submission request
     * @return The saved code submission
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
     * GET /api/code/latest/{interviewId}
     * Get the latest code submission for an interview
     *
     * @param interviewId The interview ID
     * @return The latest code submission
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
     * POST /api/code/execute
     * Execute code in Docker sandbox and run tests
     *
     * @param request The code execution request containing interviewId, language, and code
     * @return The execution results with test outcomes and auto score
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
}
