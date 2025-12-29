package com.example.interviewAI.service;

import com.example.interviewAI.dto.CodeExecutionRequest;
import com.example.interviewAI.dto.CodeExecutionResponse;
import com.example.interviewAI.dto.DockerExecutionResult;
import com.example.interviewAI.dto.TestCaseResult;
import com.example.interviewAI.entity.CodeExecution;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.repository.CodeExecutionRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.TestCaseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class CodeExecutionService {

    private final InterviewRepository interviewRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodeExecutionRepository codeExecutionRepository;
    private final DockerSandboxService dockerSandboxService;
    private final TestRunnerService testRunnerService;
    private final ScoringService scoringService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CodeExecutionService(
            InterviewRepository interviewRepository,
            TestCaseRepository testCaseRepository,
            CodeExecutionRepository codeExecutionRepository,
            DockerSandboxService dockerSandboxService,
            TestRunnerService testRunnerService,
            ScoringService scoringService
    ) {
        this.interviewRepository = interviewRepository;
        this.testCaseRepository = testCaseRepository;
        this.codeExecutionRepository = codeExecutionRepository;
        this.dockerSandboxService = dockerSandboxService;
        this.testRunnerService = testRunnerService;
        this.scoringService = scoringService;
    }

    /**
     * Execute code in Docker sandbox and run tests
     */
    public CodeExecutionResponse executeCode(CodeExecutionRequest request) {
        log.info("Executing code for interview {}", request.getInterviewId());

        // 1. Validate interview
        Interview interview = interviewRepository.findById(request.getInterviewId())
                .orElseThrow(() -> new IllegalArgumentException("Interview not found: " + request.getInterviewId()));

        if (!"in_progress".equals(interview.getStatus())) {
            log.warn("Interview {} is not in progress, status: {}", request.getInterviewId(), interview.getStatus());
            return CodeExecutionResponse.builder()
                    .interviewId(request.getInterviewId())
                    .status("error")
                    .errorMessage("Interview is not active. Current status: " + interview.getStatus())
                    .executedAt(LocalDateTime.now())
                    .build();
        }

        // 2. Get test cases for the question
        List<TestCase> testCases = testCaseRepository.findByQuestionIdOrderByOrderIndex(
                interview.getQuestion().getId()
        );

        if (testCases.isEmpty()) {
            log.warn("No test cases found for question {}", interview.getQuestion().getId());
            return CodeExecutionResponse.builder()
                    .interviewId(request.getInterviewId())
                    .status("success")
                    .testsPassed(0)
                    .testsTotal(0)
                    .autoScore(0)
                    .errorMessage("No test cases defined for this question")
                    .executedAt(LocalDateTime.now())
                    .build();
        }

        log.debug("Found {} test cases for question {}", testCases.size(), interview.getQuestion().getId());

        // 3. Generate test harness (code + tests)
        String testHarness;
        try {
            testHarness = testRunnerService.generateTestHarness(
                    request.getLanguage(),
                    request.getCode(),
                    testCases
            );
            log.debug("Generated test harness ({} chars)", testHarness.length());
        } catch (Exception e) {
            log.error("Failed to generate test harness", e);
            return CodeExecutionResponse.builder()
                    .interviewId(request.getInterviewId())
                    .status("error")
                    .errorMessage("Failed to generate test harness: " + e.getMessage())
                    .executedAt(LocalDateTime.now())
                    .build();
        }

        // 4. Execute in Docker sandbox
        DockerExecutionResult dockerResult = dockerSandboxService.execute(
                request.getLanguage(),
                testHarness
        );

        log.debug("Docker execution completed: status={}, exitCode={}, executionTime={}ms",
                dockerResult.getStatus(), dockerResult.getExitCode(), dockerResult.getExecutionTimeMs());

        // 5. Parse test results
        List<TestCaseResult> testResults;
        if (dockerResult.isSuccess() || "error".equals(dockerResult.getStatus())) {
            // Try to parse results even if there was an error (tests may have partially run)
            testResults = testRunnerService.parseResults(
                    dockerResult.getStdout(),
                    testCases
            );
        } else {
            // Timeout or other fatal error - mark all tests as failed
            testResults = testCases.stream()
                    .map(tc -> TestCaseResult.builder()
                            .testCaseId(tc.getId())
                            .testName(tc.getTestName())
                            .passed(false)
                            .errorMessage(dockerResult.getErrorMessage())
                            .build())
                    .toList();
        }

        // 6. Calculate scores
        int testsPassed = (int) testResults.stream().filter(TestCaseResult::getPassed).count();
        int testsTotal = testResults.size();
        int autoScore = scoringService.calculateAutoScoreFromTests(testsPassed, testsTotal);

        log.info("Execution complete for interview {}: {}/{} tests passed, autoScore={}",
                request.getInterviewId(), testsPassed, testsTotal, autoScore);

        // 7. Save execution result to database
        try {
            String testDetailsJson = objectMapper.writeValueAsString(testResults);
            CodeExecution codeExecution = CodeExecution.builder()
                    .interview(interview)
                    .status(dockerResult.getStatus())
                    .testsPassed(testsPassed)
                    .testsTotal(testsTotal)
                    .autoScore(autoScore)
                    .executionTimeMs(dockerResult.getExecutionTimeMs())
                    .testDetails(testDetailsJson)
                    .errorMessage(dockerResult.getErrorMessage())
                    .stdout(dockerResult.getStdout())
                    .stderr(dockerResult.getStderr())
                    .executedAt(LocalDateTime.now())
                    .build();
            codeExecutionRepository.save(codeExecution);
            log.debug("Saved code execution result for interview {}", request.getInterviewId());
        } catch (Exception e) {
            log.error("Failed to save code execution result", e);
            // Don't fail the execution if we can't save the result
        }

        // 8. Build response
        return CodeExecutionResponse.builder()
                .interviewId(request.getInterviewId())
                .status(dockerResult.getStatus())
                .testsPassed(testsPassed)
                .testsTotal(testsTotal)
                .autoScore(autoScore)
                .executionTimeMs(dockerResult.getExecutionTimeMs())
                .testDetails(testResults)
                .errorMessage(dockerResult.getErrorMessage())
                .stdout(dockerResult.getStdout())
                .stderr(dockerResult.getStderr())
                .executedAt(LocalDateTime.now())
                .build();
    }
}
