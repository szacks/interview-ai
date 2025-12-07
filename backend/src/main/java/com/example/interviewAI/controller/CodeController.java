package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CodeSubmissionRequest;
import com.example.interviewAI.dto.CodeSubmissionResponse;
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

        try {
            CodeSubmissionResponse response = codeService.getLatestCode(interviewId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error fetching code: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
