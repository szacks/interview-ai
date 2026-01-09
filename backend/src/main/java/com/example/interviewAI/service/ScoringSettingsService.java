package com.example.interviewAI.service;

import com.example.interviewAI.dto.ScoringParameterRequest;
import com.example.interviewAI.dto.ScoringParameterResponse;
import com.example.interviewAI.dto.ScoringSettingsRequest;
import com.example.interviewAI.dto.ScoringSettingsResponse;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.ScoringParameter;
import com.example.interviewAI.entity.ScoringSettings;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.ScoringParameterRepository;
import com.example.interviewAI.repository.ScoringSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoringSettingsService {

    private final ScoringSettingsRepository scoringSettingsRepository;
    private final ScoringParameterRepository scoringParameterRepository;
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

        // Update overall weights
        settings.setAutoScoreWeight(request.getAutoScoreWeight());
        settings.setManualScoreWeight(request.getManualScoreWeight());

        // Update parameters if provided
        if (request.getParameters() != null && !request.getParameters().isEmpty()) {
            settings.getParameters().clear();
            for (int i = 0; i < request.getParameters().size(); i++) {
                ScoringParameterRequest paramRequest = request.getParameters().get(i);
                ScoringParameter param = new ScoringParameter();
                param.setScoringSettings(settings);
                param.setName(paramRequest.getName());
                param.setDescription(paramRequest.getDescription());
                param.setOrderIndex(i);
                param.setCreatedAt(LocalDateTime.now());
                settings.getParameters().add(param);
            }
        }

        settings.setUpdatedAt(LocalDateTime.now());
        ScoringSettings saved = scoringSettingsRepository.save(settings);

        log.info("Scoring settings updated for company: {} - autoWeight={}, manualWeight={}",
                companyId, saved.getAutoScoreWeight(), saved.getManualScoreWeight());

        return toResponse(saved);
    }

    /**
     * Add a new parameter to scoring settings.
     */
    public ScoringSettingsResponse addParameter(Long companyId, ScoringParameterRequest paramRequest) {
        log.info("Adding parameter '{}' for company: {}", paramRequest.getName(), companyId);

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

        // Create new parameter
        ScoringParameter param = new ScoringParameter();
        param.setScoringSettings(settings);
        param.setName(paramRequest.getName());
        param.setDescription(paramRequest.getDescription());
        param.setOrderIndex(settings.getParameters().size());
        param.setCreatedAt(LocalDateTime.now());
        param.setIsDefault(false);

        settings.getParameters().add(param);
        settings.setUpdatedAt(LocalDateTime.now());

        ScoringSettings saved = scoringSettingsRepository.save(settings);

        log.info("Parameter '{}' added for company: {}", paramRequest.getName(), companyId);

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
        settings.setCreatedAt(LocalDateTime.now());
        settings.setUpdatedAt(LocalDateTime.now());

        // Create default parameters
        settings.setParameters(createDefaultParameters(settings));

        return scoringSettingsRepository.save(settings);
    }

    /**
     * Create default assessment parameters.
     */
    private List<ScoringParameter> createDefaultParameters(ScoringSettings settings) {
        List<ScoringParameter> params = new ArrayList<>();

        params.add(createParameter(settings, "Communication",
                "Can explain code clearly, uses correct terminology", 1, true));
        params.add(createParameter(settings, "Algorithmic Thinking",
                "Considers edge cases, discusses alternatives", 2, true));
        params.add(createParameter(settings, "Problem Solving",
                "Clean code, systematic debugging, error handling", 3, true));
        params.add(createParameter(settings, "AI Collaboration",
                "Uses AI effectively, reviews suggestions critically", 4, true));

        return params;
    }

    /**
     * Helper to create a parameter.
     */
    private ScoringParameter createParameter(ScoringSettings settings, String name, String description,
                                            Integer orderIndex, Boolean isDefault) {
        ScoringParameter param = new ScoringParameter();
        param.setScoringSettings(settings);
        param.setName(name);
        param.setDescription(description);
        param.setOrderIndex(orderIndex);
        param.setIsDefault(isDefault);
        param.setCreatedAt(LocalDateTime.now());
        return param;
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
        response.setParameters(settings.getParameters().stream()
                .map(this::toParameterResponse)
                .collect(Collectors.toList()));
        response.setCreatedAt(settings.getCreatedAt());
        response.setUpdatedAt(settings.getUpdatedAt());
        return response;
    }

    /**
     * Convert parameter entity to response DTO.
     */
    private ScoringParameterResponse toParameterResponse(ScoringParameter param) {
        ScoringParameterResponse response = new ScoringParameterResponse();
        response.setId(param.getId());
        response.setName(param.getName());
        response.setDescription(param.getDescription());
        response.setOrderIndex(param.getOrderIndex());
        response.setIsDefault(param.getIsDefault());
        return response;
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
