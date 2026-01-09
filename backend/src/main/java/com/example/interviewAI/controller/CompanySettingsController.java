package com.example.interviewAI.controller;

import com.example.interviewAI.dto.*;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.service.CompanySettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/company-settings")
@RequiredArgsConstructor
public class CompanySettingsController {
    private final CompanySettingsService companySettingsService;
    private final UserRepository userRepository;

    /**
     * Get company settings with assessment parameters
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<CompanySettingsResponse> getSettings(Authentication authentication) {
        Long companyId = getCompanyId(authentication);
        log.debug("Getting company settings for company: {}", companyId);
        return ResponseEntity.ok(companySettingsService.getSettingsWithParameters(companyId));
    }

    /**
     * Update company settings (admin only)
     */
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingsResponse> updateSettings(
            Authentication authentication,
            @RequestBody UpdateCompanySettingsRequest request) {
        Long companyId = getCompanyId(authentication);
        log.info("Updating company settings for company: {}", companyId);
        return ResponseEntity.ok(companySettingsService.updateSettings(companyId, request));
    }

    /**
     * Update score distribution (admin only)
     */
    @PutMapping("/score-distribution")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingsResponse> updateScoreDistribution(
            Authentication authentication,
            @RequestParam Integer autoWeight,
            @RequestParam Integer manualWeight) {
        Long companyId = getCompanyId(authentication);
        log.info("Updating score distribution for company: {} (auto: {}, manual: {})",
                companyId, autoWeight, manualWeight);
        return ResponseEntity.ok(companySettingsService.updateScoreDistribution(companyId, autoWeight, manualWeight));
    }

    // ==================== Assessment Parameters ====================

    /**
     * Get all assessment parameters for the company
     */
    @GetMapping("/assessment-parameters")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<AssessmentParameterResponse>> getAssessmentParameters(Authentication authentication) {
        Long companyId = getCompanyId(authentication);
        log.debug("Getting assessment parameters for company: {}", companyId);
        return ResponseEntity.ok(companySettingsService.getAssessmentParameters(companyId));
    }

    /**
     * Get only active assessment parameters for the company
     */
    @GetMapping("/assessment-parameters/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<AssessmentParameterResponse>> getActiveAssessmentParameters(Authentication authentication) {
        Long companyId = getCompanyId(authentication);
        log.debug("Getting active assessment parameters for company: {}", companyId);
        return ResponseEntity.ok(companySettingsService.getActiveAssessmentParameters(companyId));
    }

    /**
     * Create a new assessment parameter (admin only)
     */
    @PostMapping("/assessment-parameters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssessmentParameterResponse> createAssessmentParameter(
            Authentication authentication,
            @Valid @RequestBody CreateAssessmentParameterRequest request) {
        Long companyId = getCompanyId(authentication);
        log.info("Creating assessment parameter for company: {} - {}", companyId, request.getName());
        return ResponseEntity.ok(companySettingsService.createAssessmentParameter(companyId, request));
    }

    /**
     * Update an assessment parameter (admin only)
     */
    @PutMapping("/assessment-parameters/{parameterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AssessmentParameterResponse> updateAssessmentParameter(
            Authentication authentication,
            @PathVariable Long parameterId,
            @RequestBody UpdateAssessmentParameterRequest request) {
        Long companyId = getCompanyId(authentication);
        log.info("Updating assessment parameter {} for company: {}", parameterId, companyId);
        return ResponseEntity.ok(companySettingsService.updateAssessmentParameter(companyId, parameterId, request));
    }

    /**
     * Delete an assessment parameter (admin only)
     */
    @DeleteMapping("/assessment-parameters/{parameterId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteAssessmentParameter(
            Authentication authentication,
            @PathVariable Long parameterId) {
        Long companyId = getCompanyId(authentication);
        log.info("Deleting assessment parameter {} for company: {}", parameterId, companyId);
        companySettingsService.deleteAssessmentParameter(companyId, parameterId);
        return ResponseEntity.ok(Map.of("message", "Assessment parameter deleted successfully"));
    }

    /**
     * Get current user's company ID from authentication
     */
    private Long getCompanyId(Authentication authentication) {
        String currentUserEmail = (String) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        if (currentUser.getCompany() == null) {
            throw new IllegalStateException("User is not associated with a company");
        }

        return currentUser.getCompany().getId();
    }
}
