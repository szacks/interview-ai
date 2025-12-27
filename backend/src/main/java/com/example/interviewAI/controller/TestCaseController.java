package com.example.interviewAI.controller;

import com.example.interviewAI.dto.TestCaseResponse;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for test case operations.
 */
@Slf4j
@RestController
@RequestMapping("/test-cases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseRepository testCaseRepository;

    /**
     * Get a specific test case by ID.
     *
     * @param testCaseId test case identifier
     * @return test case details
     */
    @GetMapping("/{testCaseId}")
    public ResponseEntity<TestCaseResponse> getTestCase(@PathVariable Long testCaseId) {
        log.debug("Fetching test case with ID: {}", testCaseId);

        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found: " + testCaseId));

        TestCaseResponse response = new TestCaseResponse(
                testCase.getId(),
                testCase.getTestName(),
                testCase.getTestCase(),
                testCase.getDescription(),
                testCase.getOperationsJson(),
                testCase.getAssertionsJson(),
                testCase.getOrderIndex(),
                testCase.getPassed()
        );

        return ResponseEntity.ok(response);
    }
}
