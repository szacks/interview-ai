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
import com.example.interviewAI.service.ClaudeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.ArrayList;
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
    private final ClaudeService claudeService;
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
            // Step 1: Generate implementation using Claude AI
            String aiImplementation = generateImplementationWithClaude(request);

            if (aiImplementation == null || aiImplementation.isEmpty()) {
                return ResponseEntity.internalServerError().body(
                        ValidateTestsWithAIResponse.builder()
                                .passed(0)
                                .failed(request.getTests().size())
                                .aiImplementation("")
                                .explanation("Failed to generate implementation from Claude API. Please check your API key configuration.")
                                .build()
                );
            }

            // Step 2: Build test harness combining AI implementation with test cases
            String testHarness = buildTestHarness(
                    request.getPrimaryLanguage(),
                    aiImplementation,
                    request.getTests()
            );

            // Step 3: Execute in Docker sandbox
            com.example.interviewAI.dto.DockerExecutionResult executionResult = dockerSandboxService.execute(
                    request.getPrimaryLanguage(),
                    testHarness
            );

            // Step 4: Parse results
            ValidateTestsWithAIResponse response = parseValidationResults(
                    executionResult,
                    request.getTests(),
                    aiImplementation
            );

            log.info("Test validation completed for question: {} - Passed: {}, Failed: {}",
                    request.getTitle(), response.getPassed(), response.getFailed());

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
     * Generate implementation code using Claude AI based on test cases
     */
    private String generateImplementationWithClaude(ValidateTestsWithAIRequest request) {
        String prompt = buildCodeGenerationPrompt(request);

        try {
            // Build Claude request
            List<com.example.interviewAI.dto.ClaudeEvaluationRequest.ClaudeMessage> messages =
                    new ArrayList<>();
            messages.add(
                    com.example.interviewAI.dto.ClaudeEvaluationRequest.ClaudeMessage.builder()
                            .role("user")
                            .content(prompt)
                            .build()
            );

            com.example.interviewAI.dto.ClaudeEvaluationRequest claudeRequest =
                    com.example.interviewAI.dto.ClaudeEvaluationRequest.builder()
                            .model("claude-haiku-4-5-20251001")
                            .maxTokens(2048)
                            .temperature(0.0)
                            .messages(messages)
                            .build();

            // Call Claude API
            com.example.interviewAI.dto.ClaudeEvaluationResponse response =
                    callClaudeForCodeGeneration(claudeRequest);

            if (response == null || response.getContent() == null || response.getContent().isEmpty()) {
                log.warn("Empty response from Claude API for code generation");
                return null;
            }

            String responseText = response.getContent().get(0).getText();

            // Extract code block from response
            String implementation = extractCodeBlock(responseText, request.getPrimaryLanguage());
            log.debug("Generated implementation of length: {}", implementation.length());

            return implementation;

        } catch (Exception e) {
            log.error("Error generating implementation with Claude: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Build prompt for Claude to generate implementation from tests
     */
    private String buildCodeGenerationPrompt(ValidateTestsWithAIRequest request) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert code generator. Your task is to write a complete, working implementation ")
                .append("that passes all the provided test cases.\n\n");

        prompt.append("## Problem\n");
        prompt.append(request.getTitle()).append("\n\n");

        prompt.append("## Description\n");
        prompt.append(request.getDescription()).append("\n\n");

        prompt.append("## Code Template\n");
        prompt.append("```").append(request.getPrimaryLanguage()).append("\n");
        prompt.append(request.getCodeTemplate()).append("\n");
        prompt.append("```\n\n");

        prompt.append("## Test Cases to Pass\n");
        for (int i = 0; i < request.getTests().size(); i++) {
            ValidateTestsWithAIRequest.TestCaseDefinition test = request.getTests().get(i);
            prompt.append(String.format("Test %d: %s\n", i + 1, test.getName()));
            if (test.getDescription() != null && !test.getDescription().isEmpty()) {
                prompt.append("  Description: ").append(test.getDescription()).append("\n");
            }
            if (test.getSetup() != null && !test.getSetup().isEmpty()) {
                prompt.append("  Setup: ").append(test.getSetup()).append("\n");
            }
            prompt.append("  Input: ").append(test.getInput()).append("\n");
            prompt.append("  Expected Output: ").append(test.getExpectedOutput()).append("\n\n");
        }

        prompt.append("## Instructions\n");
        prompt.append("1. Complete the implementation in the template to pass all tests\n");
        prompt.append("2. Write clean, efficient code\n");
        prompt.append("3. Return ONLY the complete, runnable code for the language ").append(request.getPrimaryLanguage()).append("\n");
        prompt.append("4. Wrap the code in a code block with triple backticks\n\n");

        return prompt.toString();
    }

    /**
     * Extract code block from Claude response
     */
    private String extractCodeBlock(String response, String language) {
        // Look for code block markers
        String startMarker = "```" + language.toLowerCase();
        String endMarker = "```";

        int startIdx = response.indexOf(startMarker);
        if (startIdx == -1) {
            // Try without language specification
            startMarker = "```";
            startIdx = response.indexOf(startMarker);
        }

        if (startIdx != -1) {
            startIdx += startMarker.length();
            int endIdx = response.indexOf(endMarker, startIdx);
            if (endIdx != -1) {
                String code = response.substring(startIdx, endIdx).trim();
                // Remove leading newline if present
                if (code.startsWith("\n")) {
                    code = code.substring(1);
                }
                return code;
            }
        }

        // If no code block found, return entire response as-is
        log.warn("Could not extract code block from Claude response, using entire response");
        return response.trim();
    }

    /**
     * Build test harness for the language that combines implementation with test assertions
     */
    private String buildTestHarness(String language, String implementation,
                                    List<ValidateTestsWithAIRequest.TestCaseDefinition> tests) {
        return switch (language.toLowerCase()) {
            case "javascript", "node" -> buildJavaScriptTestHarness(implementation, tests);
            case "python" -> buildPythonTestHarness(implementation, tests);
            case "java" -> buildJavaTestHarness(implementation, tests);
            default -> throw new IllegalArgumentException("Unsupported language: " + language);
        };
    }

    /**
     * Build JavaScript test harness
     */
    private String buildJavaScriptTestHarness(String implementation,
                                             List<ValidateTestsWithAIRequest.TestCaseDefinition> tests) {
        StringBuilder sb = new StringBuilder();

        // Implementation
        sb.append(implementation).append("\n\n");

        // Test runner with assertion support
        sb.append("""
                const testResults = [];

                function assert(condition, message = 'Assertion failed') {
                  if (!condition) {
                    throw new Error(message);
                  }
                }

                """);

        // Test execution
        for (ValidateTestsWithAIRequest.TestCaseDefinition test : tests) {
            sb.append(String.format("// Test: %s\n", test.getName()));
            sb.append("try {\n");

            // Setup code if provided
            if (test.getSetup() != null && !test.getSetup().isEmpty()) {
                sb.append("  ").append(test.getSetup().replace("\n", "\n  ")).append("\n");
            }

            // Test input/execution - this should contain assertions
            sb.append("  ").append(test.getInput().replace("\n", "\n  ")).append("\n");

            // If we get here, all assertions passed
            sb.append(String.format("  testResults.push({ testName: '%s', passed: true });\n",
                    test.getName().replace("'", "\\'")));

            sb.append("} catch (error) {\n");
            sb.append(String.format("  testResults.push({ testName: '%s', passed: false, error: error.message });\n",
                    test.getName().replace("'", "\\'")));
            sb.append("}\n\n");
        }

        sb.append("console.log(JSON.stringify({ results: testResults }));\n");

        return sb.toString();
    }

    /**
     * Build Python test harness
     */
    private String buildPythonTestHarness(String implementation,
                                         List<ValidateTestsWithAIRequest.TestCaseDefinition> tests) {
        StringBuilder sb = new StringBuilder();

        // Implementation
        sb.append(implementation).append("\n\n");

        // Test runner with assertion support
        sb.append("""
                import json

                def assert_equal(expected, actual, message=''):
                    if expected != actual:
                        raise AssertionError(f'Expected {expected}, got {actual}. {message}')

                test_results = []

                """);

        // Test execution
        for (ValidateTestsWithAIRequest.TestCaseDefinition test : tests) {
            sb.append(String.format("# Test: %s\n", test.getName()));
            sb.append("try:\n");

            // Setup code if provided
            if (test.getSetup() != null && !test.getSetup().isEmpty()) {
                sb.append("    ").append(test.getSetup().replace("\n", "\n    ")).append("\n");
            }

            // Test input/execution - this should contain assertions
            sb.append("    ").append(test.getInput().replace("\n", "\n    ")).append("\n");

            // If we get here, all assertions passed
            sb.append(String.format("    test_results.append({{'testName': '%s', 'passed': True}})\n",
                    test.getName().replace("'", "\\'")));

            sb.append("except Exception as e:\n");
            sb.append(String.format("    test_results.append({{'testName': '%s', 'passed': False, 'error': str(e)}})\n",
                    test.getName().replace("'", "\\'")));
            sb.append("\n");
        }

        sb.append("print(json.dumps({'results': test_results}))\n");

        return sb.toString();
    }

    /**
     * Build Java test harness
     */
    private String buildJavaTestHarness(String implementation,
                                       List<ValidateTestsWithAIRequest.TestCaseDefinition> tests) {
        StringBuilder sb = new StringBuilder();

        // Implementation
        sb.append(implementation).append("\n\n");

        // Test runner class with assertion support
        sb.append("""
                import java.util.*;
                import com.fasterxml.jackson.databind.ObjectMapper;

                public class TestRunner {
                    public static void assertEquals(Object expected, Object actual) {
                        if (!Objects.equals(expected, actual)) {
                            throw new AssertionError("Expected " + expected + ", got " + actual);
                        }
                    }

                    public static void assertTrue(boolean condition) {
                        if (!condition) {
                            throw new AssertionError("Assertion failed");
                        }
                    }

                    public static void main(String[] args) throws Exception {
                        List<Map<String, Object>> testResults = new ArrayList<>();

                """);

        // Test execution
        for (ValidateTestsWithAIRequest.TestCaseDefinition test : tests) {
            sb.append(String.format("        // Test: %s\n", test.getName()));
            sb.append("        try {\n");

            // Setup code if provided
            if (test.getSetup() != null && !test.getSetup().isEmpty()) {
                sb.append("            ").append(test.getSetup().replace("\n", "\n            ")).append("\n");
            }

            // Test input/execution - should contain assertions
            sb.append("            ").append(test.getInput().replace("\n", "\n            ")).append("\n");

            // If we get here, all assertions passed
            sb.append("            Map<String, Object> result = new HashMap<>();\n");
            sb.append(String.format("            result.put(\"testName\", \"%s\");\n", test.getName()));
            sb.append("            result.put(\"passed\", true);\n");
            sb.append("            testResults.add(result);\n");

            sb.append("        } catch (Exception e) {\n");
            sb.append("            Map<String, Object> result = new HashMap<>();\n");
            sb.append(String.format("            result.put(\"testName\", \"%s\");\n", test.getName()));
            sb.append("            result.put(\"passed\", false);\n");
            sb.append("            result.put(\"error\", e.getMessage());\n");
            sb.append("            testResults.add(result);\n");
            sb.append("        }\n\n");
        }

        sb.append("        System.out.println(new ObjectMapper().writeValueAsString(")
                .append("new HashMap<String, Object>() {{ put(\"results\", testResults); }}));\n");
        sb.append("    }\n");
        sb.append("}\n");

        return sb.toString();
    }

    /**
     * Call Claude API for code generation
     */
    private com.example.interviewAI.dto.ClaudeEvaluationResponse callClaudeForCodeGeneration(
            com.example.interviewAI.dto.ClaudeEvaluationRequest request) {
        try {
            return claudeService.callClaudeAPIWithRequest(request);
        } catch (Exception e) {
            log.error("Error calling Claude API: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Parse Docker execution results and build validation response
     */
    private ValidateTestsWithAIResponse parseValidationResults(
            com.example.interviewAI.dto.DockerExecutionResult executionResult,
            List<ValidateTestsWithAIRequest.TestCaseDefinition> tests,
            String aiImplementation) {

        List<ValidateTestsWithAIResponse.TestExecutionResult> results = new ArrayList<>();
        int passed = 0;
        int failed = 0;

        if ("success".equals(executionResult.getStatus())) {
            // Parse test results from stdout
            try {
                String stdout = executionResult.getStdout();
                int jsonStart = stdout.lastIndexOf("{\"results\":");
                if (jsonStart == -1) {
                    jsonStart = stdout.lastIndexOf("{\"results");
                }

                if (jsonStart != -1) {
                    String json = stdout.substring(jsonStart);
                    com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(json);
                    com.fasterxml.jackson.databind.JsonNode resultsNode = root.get("results");

                    if (resultsNode != null && resultsNode.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode testResult : resultsNode) {
                            ValidateTestsWithAIResponse.TestExecutionResult result =
                                    ValidateTestsWithAIResponse.TestExecutionResult.builder()
                                    .testName(testResult.has("testName") ? testResult.get("testName").asText() : "Unknown")
                                    .passed(testResult.has("passed") && testResult.get("passed").asBoolean())
                                    .expected(testResult.has("expected") ? testResult.get("expected").asText() : null)
                                    .actual(testResult.has("actual") ? testResult.get("actual").asText() : null)
                                    .error(testResult.has("error") ? testResult.get("error").asText() : null)
                                    .build();

                            results.add(result);
                            if (result.isPassed()) {
                                passed++;
                            } else {
                                failed++;
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse test results from stdout: {}", e.getMessage());
                // Fallback: mark all tests as failed
                for (ValidateTestsWithAIRequest.TestCaseDefinition test : tests) {
                    results.add(ValidateTestsWithAIResponse.TestExecutionResult.builder()
                            .testName(test.getName())
                            .passed(false)
                            .error("Failed to parse test results: " + e.getMessage())
                            .build());
                    failed++;
                }
            }
        } else {
            // Execution failed
            String errorMsg = executionResult.getErrorMessage() != null ?
                    executionResult.getErrorMessage() :
                    executionResult.getStderr();

            for (ValidateTestsWithAIRequest.TestCaseDefinition test : tests) {
                results.add(ValidateTestsWithAIResponse.TestExecutionResult.builder()
                        .testName(test.getName())
                        .passed(false)
                        .error(errorMsg)
                        .build());
            }
            failed = tests.size();
        }

        // Build explanation
        String explanation = String.format(
                "Validation completed. %d test(s) passed, %d test(s) failed.",
                passed, failed
        );

        return ValidateTestsWithAIResponse.builder()
                .passed(passed)
                .failed(failed)
                .results(results)
                .aiImplementation(aiImplementation)
                .explanation(explanation)
                .build();
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
