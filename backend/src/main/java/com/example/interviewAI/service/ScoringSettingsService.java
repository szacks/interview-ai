package com.example.interviewAI.service;

import com.example.interviewAI.dto.ScoringSettingsRequest;
import com.example.interviewAI.dto.ScoringSettingsResponse;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.ScoringSettings;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.ScoringSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringSettingsService {

    private final ScoringSettingsRepository scoringSettingsRepository;
    private final CompanyRepository companyRepository;

    /**
     * Get scoring settings for a company. If not found, return default settings.
     */
    public ScoringSettingsResponse getSettingsByCompanyId(Long companyId) {
        log.debug("Fetching scoring settings for company: {}", companyId);

        // Verify company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        // Get existing settings or create default
        ScoringSettings settings = scoringSettingsRepository.findByCompanyId(companyId)
                .orElseGet(() -> createDefaultSettings(company));

        return toResponse(settings);
    }

    /**
     * Update scoring settings for a company.
     */
    public ScoringSettingsResponse updateSettings(Long companyId, ScoringSettingsRequest request) {
        log.info("Updating scoring settings for company: {}", companyId);

        // Verify company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        // Get existing settings or create new
        ScoringSettings settings = scoringSettingsRepository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    ScoringSettings newSettings = new ScoringSettings();
                    newSettings.setCompany(company);
                    newSettings.setCreatedAt(LocalDateTime.now());
                    return newSettings;
                });

        // Update weights
        settings.setAutoScoreWeight(request.getAutoScoreWeight());
        settings.setManualScoreWeight(request.getManualScoreWeight());
        settings.setCommunicationWeight(request.getCommunicationWeight());
        settings.setAlgorithmicWeight(request.getAlgorithmicWeight());
        settings.setProblemSolvingWeight(request.getProblemSolvingWeight());
        settings.setAiCollaborationWeight(request.getAiCollaborationWeight());

        // Update additional parameters if provided
        if (request.getAdditionalParameters() != null) {
            settings.setAdditionalParameters(request.getAdditionalParameters());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        ScoringSettings saved = scoringSettingsRepository.save(settings);

        log.info("Scoring settings updated for company: {} - autoWeight={}, manualWeight={}",
                companyId, saved.getAutoScoreWeight(), saved.getManualScoreWeight());

        return toResponse(saved);
    }

    /**
     * Add or update an additional parameter.
     */
    public ScoringSettingsResponse addParameter(Long companyId, String paramName, Double paramWeight) {
        log.info("Adding parameter '{}' with weight {} for company: {}", paramName, paramWeight, companyId);

        // Verify company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        ScoringSettings settings = scoringSettingsRepository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    ScoringSettings newSettings = new ScoringSettings();
                    newSettings.setCompany(company);
                    newSettings.setCreatedAt(LocalDateTime.now());
                    return newSettings;
                });

        // Parse existing parameters or create new JSON
        // For simplicity, storing as JSON string
        // In a production system, consider a separate ParameterSettings entity
        String currentParams = settings.getAdditionalParameters() != null ?
                settings.getAdditionalParameters() : "[]";

        // Simple JSON manipulation (in production, use proper JSON library like Jackson)
        String newParams = addParameterToJson(currentParams, paramName, paramWeight);
        settings.setAdditionalParameters(newParams);
        settings.setUpdatedAt(LocalDateTime.now());

        ScoringSettings saved = scoringSettingsRepository.save(settings);

        log.info("Parameter '{}' added for company: {}", paramName, companyId);

        return toResponse(saved);
    }

    /**
     * Save changes to scoring settings (wrapper for updateSettings).
     */
    public ScoringSettingsResponse saveChanges(Long companyId, ScoringSettingsRequest request) {
        log.info("Saving changes to scoring settings for company: {}", companyId);
        return updateSettings(companyId, request);
    }

    /**
     * Create default scoring settings for a company.
     */
    private ScoringSettings createDefaultSettings(Company company) {
        log.debug("Creating default scoring settings for company: {}", company.getId());

        ScoringSettings settings = new ScoringSettings();
        settings.setCompany(company);
        settings.setAutoScoreWeight(0.4);
        settings.setManualScoreWeight(0.6);
        settings.setCommunicationWeight(0.25);
        settings.setAlgorithmicWeight(0.25);
        settings.setProblemSolvingWeight(0.25);
        settings.setAiCollaborationWeight(0.25);
        settings.setCreatedAt(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());

        return scoringSettingsRepository.save(settings);
    }

    /**
     * Convert entity to response DTO.
     */
    private ScoringSettingsResponse toResponse(ScoringSettings settings) {
        ScoringSettingsResponse response = new ScoringSettingsResponse();
        response.setId(settings.getId());
        response.setCompanyId(settings.getCompany().getId());
        response.setAutoScoreWeight(settings.getAutoScoreWeight());
        response.setManualScoreWeight(settings.getManualScoreWeight());
        response.setCommunicationWeight(settings.getCommunicationWeight());
        response.setAlgorithmicWeight(settings.getAlgorithmicWeight());
        response.setProblemSolvingWeight(settings.getProblemSolvingWeight());
        response.setAiCollaborationWeight(settings.getAiCollaborationWeight());
        response.setAdditionalParameters(settings.getAdditionalParameters());
        response.setCreatedAt(settings.getCreatedAt());
        response.setUpdatedAt(settings.getUpdatedAt());
        return response;
    }

    /**
     * Helper method to add parameter to JSON string.
     * In production, use Jackson's ObjectMapper for proper JSON handling.
     */
    private String addParameterToJson(String jsonArray, String paramName, Double paramWeight) {
        // Simple implementation - in production use proper JSON library
        if (jsonArray == null || jsonArray.isEmpty() || jsonArray.equals("[]")) {
            return String.format("[{\"name\":\"%s\",\"weight\":%f}]", paramName, paramWeight);
        }

        // Remove closing bracket and append new parameter
        String updatedJson = jsonArray.substring(0, jsonArray.length() - 1);
        return updatedJson + String.format(",{\"name\":\"%s\",\"weight\":%f}]", paramName, paramWeight);
    }

    /**
     * Get effective scoring weights. Used by ScoringService to calculate scores.
     */
    public Double getAutoScoreWeight(Long companyId) {
        return scoringSettingsRepository.findByCompanyId(companyId)
                .map(ScoringSettings::getAutoScoreWeight)
                .orElse(0.4);
    }

    /**
     * Get effective manual score weight. Used by ScoringService to calculate scores.
     */
    public Double getManualScoreWeight(Long companyId) {
        return scoringSettingsRepository.findByCompanyId(companyId)
                .map(ScoringSettings::getManualScoreWeight)
                .orElse(0.6);
    }
}
