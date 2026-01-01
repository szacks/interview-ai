package com.example.interviewAI.controller;

import com.example.interviewAI.dto.CodeExecutionRequest;
import com.example.interviewAI.dto.CodeExecutionResponse;
import com.example.interviewAI.dto.CodeSubmissionRequest;
import com.example.interviewAI.dto.CodeSubmissionResponse;
import com.example.interviewAI.dto.ValidationRequest;
import com.example.interviewAI.dto.ValidationResponse;
import com.example.interviewAI.dto.ValidateTestsWithAIRequest;
import com.example.interviewAI.dto.ValidateTestsWithAIResponse;
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
    private final com.example.interviewAI.service.DockerSandboxService dockerSandboxService;
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

    /**
     * Validate template code syntax (compilation check only, no execution).
     * Used by question builders to verify templates compile before saving.
     *
     * @param request the validation request containing language and code
     * @return validation result with compilation errors if any
     */
    @PostMapping("/validate-syntax")
    public ResponseEntity<ValidationResponse> validateSyntax(
            @Valid @RequestBody ValidationRequest request) {

        log.info("Validating template syntax for language: {}", request.getLanguage());

        try {
            // Generate minimal validation harness
            String validationCode = generateValidationHarness(request.getLanguage(), request.getCode());

            // Execute in Docker sandbox (will compile but minimal execution)
            com.example.interviewAI.dto.DockerExecutionResult result = dockerSandboxService.execute(
                    request.getLanguage(),
                    validationCode
            );

            boolean success = "success".equals(result.getStatus());
            String errors = result.getStderr();

            // Extract compilation errors if any
            if (!success && "compilation_error".equals(result.getStatus())) {
                log.warn("Compilation failed for {}: {}", request.getLanguage(), errors);
            }

            return ResponseEntity.ok(ValidationResponse.builder()
                    .success(success)
                    .language(request.getLanguage())
                    .errors(errors)
                    .warnings(success && errors != null && !errors.isEmpty() ? errors : null)
                    .build());

        } catch (Exception e) {
            log.error("Error validating syntax for {}", request.getLanguage(), e);
            return ResponseEntity.internalServerError().body(
                    ValidationResponse.builder()
                            .success(false)
                            .language(request.getLanguage())
                            .errors("Internal server error: " + e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Validate test cases by generating AI implementation and running tests against it.
     * Used by question builders to verify tests pass before saving.
     *
     * @param request the validation request with test cases and code template
     * @return validation result with test execution results and AI explanation
     */
    @PostMapping("/validate-tests-with-ai")
    public ResponseEntity<ValidateTestsWithAIResponse> validateTestsWithAI(
            @Valid @RequestBody ValidateTestsWithAIRequest request) {

        log.info("Validating tests with AI for question: {}", request.getTitle());

        try {
            // For now, return a mock response indicating this endpoint needs implementation
            // In a full implementation, this would:
            // 1. Call Claude API to generate implementation
            // 2. Execute the implementation with test cases
            // 3. Compare results with expected outputs
            // 4. Return detailed results and explanation

            ValidateTestsWithAIResponse response = ValidateTestsWithAIResponse.builder()
                    .passed(0)
                    .failed(request.getTests().size())
                    .results(List.of())
                    .aiImplementation("// AI implementation placeholder\n// This endpoint needs backend implementation")
                    .explanation("Backend implementation pending. This endpoint requires integration with Claude API for code generation and Docker sandbox for test execution.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error validating tests with AI for question: {}", request.getTitle(), e);
            return ResponseEntity.internalServerError().body(
                    ValidateTestsWithAIResponse.builder()
                            .passed(0)
                            .failed(request.getTests().size())
                            .aiImplementation("")
                            .explanation("Error: " + e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Generate minimal validation harness for template code.
     * This wraps the template in executable code that just validates compilation.
     */
    private String generateValidationHarness(String language, String templateCode) {
        return switch (language.toLowerCase()) {
            case "java" -> {
                // Extract class name from template
                String className = "Solution";
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("class\\s+(\\w+)");
                java.util.regex.Matcher matcher = pattern.matcher(templateCode);
                if (matcher.find()) {
                    className = matcher.group(1);
                }

                yield templateCode + "\n\n" +
                        "// Validation harness\n" +
                        "class Validator {\n" +
                        "    public static void main(String[] args) {\n" +
                        "        System.out.println(\"Template compiles successfully\");\n" +
                        "    }\n" +
                        "}";
            }
            case "python" -> templateCode + "\n\n" +
                    "# Validation harness\n" +
                    "if __name__ == \"__main__\":\n" +
                    "    print(\"Template syntax is valid\")\n";
            case "javascript", "node" -> templateCode + "\n\n" +
                    "// Validation harness\n" +
                    "console.log(\"Template syntax is valid\");\n";
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }
}
