package com.example.interviewAI.service;

import com.example.interviewAI.dto.*;
import com.example.interviewAI.entity.AssessmentParameter;
import com.example.interviewAI.entity.CompanySettings;
import com.example.interviewAI.repository.AssessmentParameterRepository;
import com.example.interviewAI.repository.CompanySettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CompanySettingsService {
    private final CompanySettingsRepository companySettingsRepository;
    private final AssessmentParameterRepository assessmentParameterRepository;

    /**
     * Get or create company settings
     */
    public CompanySettings getOrCreateSettings(Long companyId) {
        return companySettingsRepository.findByCompanyId(companyId)
                .orElseGet(() -> {
                    CompanySettings settings = CompanySettings.builder()
                            .companyId(companyId)
                            .autoScoreWeight(40)
                            .manualScoreWeight(60)
                            .dataRetentionDays(90)
                            .defaultSessionTimeoutMinutes(120)
                            .scoreExceptionalThreshold(91)
                            .scoreStrongThreshold(81)
                            .scoreGoodThreshold(71)
                            .scoreConcerningThreshold(51)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    CompanySettings saved = companySettingsRepository.save(settings);

                    // Create default assessment parameters
                    createDefaultAssessmentParameters(companyId);

                    return saved;
                });
    }

    /**
     * Create default assessment parameters for a company
     */
    private void createDefaultAssessmentParameters(Long companyId) {
        List<AssessmentParameter> defaults = List.of(
                AssessmentParameter.builder()
                        .companyId(companyId)
                        .name("Communication")
                        .description("Clarity of explanations and ability to articulate thought process")
                        .maxScore(5)
                        .weight(BigDecimal.ONE)
                        .displayOrder(1)
                        .isActive(true)
                        .build(),
                AssessmentParameter.builder()
                        .companyId(companyId)
                        .name("Algorithmic Thinking")
                        .description("Understanding of data structures, algorithms, and complexity")
                        .maxScore(5)
                        .weight(BigDecimal.ONE)
                        .displayOrder(2)
                        .isActive(true)
                        .build(),
                AssessmentParameter.builder()
                        .companyId(companyId)
                        .name("Problem Solving")
                        .description("Approach to breaking down problems and finding solutions")
                        .maxScore(5)
                        .weight(BigDecimal.ONE)
                        .displayOrder(3)
                        .isActive(true)
                        .build(),
                AssessmentParameter.builder()
                        .companyId(companyId)
                        .name("AI Collaboration")
                        .description("Effective use of AI tools and ability to iterate on suggestions")
                        .maxScore(5)
                        .weight(BigDecimal.ONE)
                        .displayOrder(4)
                        .isActive(true)
                        .build()
        );

        assessmentParameterRepository.saveAll(defaults);
    }

    /**
     * Get company settings with assessment parameters
     */
    public CompanySettingsResponse getSettingsWithParameters(Long companyId) {
        CompanySettings settings = getOrCreateSettings(companyId);
        List<AssessmentParameter> parameters = assessmentParameterRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId);

        return mapToResponse(settings, parameters);
    }

    /**
     * Update company settings
     */
    public CompanySettingsResponse updateSettings(Long companyId, UpdateCompanySettingsRequest request) {
        CompanySettings settings = getOrCreateSettings(companyId);

        // Update score distribution
        if (request.getAutoScoreWeight() != null && request.getManualScoreWeight() != null) {
            if (request.getAutoScoreWeight() + request.getManualScoreWeight() != 100) {
                throw new IllegalArgumentException("Auto and manual score weights must sum to 100");
            }
            settings.setAutoScoreWeight(request.getAutoScoreWeight());
            settings.setManualScoreWeight(request.getManualScoreWeight());
        }

        // Update data retention
        if (request.getDataRetentionDays() != null) {
            if (request.getDataRetentionDays() < -1 || request.getDataRetentionDays() == 0) {
                throw new IllegalArgumentException("Data retention days must be positive or -1 (forever)");
            }
            settings.setDataRetentionDays(request.getDataRetentionDays());
        }

        // Update session timeout
        if (request.getDefaultSessionTimeoutMinutes() != null) {
            if (request.getDefaultSessionTimeoutMinutes() < -1 || request.getDefaultSessionTimeoutMinutes() == 0) {
                throw new IllegalArgumentException("Session timeout must be positive or -1 (never)");
            }
            settings.setDefaultSessionTimeoutMinutes(request.getDefaultSessionTimeoutMinutes());
        }

        // Update scoring thresholds
        if (request.getScoreExceptionalThreshold() != null) {
            settings.setScoreExceptionalThreshold(request.getScoreExceptionalThreshold());
        }
        if (request.getScoreStrongThreshold() != null) {
            settings.setScoreStrongThreshold(request.getScoreStrongThreshold());
        }
        if (request.getScoreGoodThreshold() != null) {
            settings.setScoreGoodThreshold(request.getScoreGoodThreshold());
        }
        if (request.getScoreConcerningThreshold() != null) {
            settings.setScoreConcerningThreshold(request.getScoreConcerningThreshold());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        CompanySettings saved = companySettingsRepository.save(settings);

        List<AssessmentParameter> parameters = assessmentParameterRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId);

        return mapToResponse(saved, parameters);
    }

    /**
     * Update score distribution
     */
    public CompanySettingsResponse updateScoreDistribution(Long companyId, Integer autoWeight, Integer manualWeight) {
        if (autoWeight + manualWeight != 100) {
            throw new IllegalArgumentException("Auto and manual score weights must sum to 100");
        }
        if (autoWeight < 0 || autoWeight > 100) {
            throw new IllegalArgumentException("Auto score weight must be between 0 and 100");
        }

        CompanySettings settings = getOrCreateSettings(companyId);
        settings.setAutoScoreWeight(autoWeight);
        settings.setManualScoreWeight(manualWeight);
        settings.setUpdatedAt(LocalDateTime.now());

        CompanySettings saved = companySettingsRepository.save(settings);
        List<AssessmentParameter> parameters = assessmentParameterRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId);

        return mapToResponse(saved, parameters);
    }

    /**
     * Get assessment parameters for a company
     */
    public List<AssessmentParameterResponse> getAssessmentParameters(Long companyId) {
        // Ensure company settings exist
        getOrCreateSettings(companyId);

        return assessmentParameterRepository
                .findByCompanyIdOrderByDisplayOrderAsc(companyId)
                .stream()
                .map(this::mapParameterToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get active assessment parameters for a company
     */
    public List<AssessmentParameterResponse> getActiveAssessmentParameters(Long companyId) {
        return assessmentParameterRepository
                .findByCompanyIdAndIsActiveOrderByDisplayOrderAsc(companyId, true)
                .stream()
                .map(this::mapParameterToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create a new assessment parameter
     */
    public AssessmentParameterResponse createAssessmentParameter(Long companyId, CreateAssessmentParameterRequest request) {
        // Check for duplicate name
        if (assessmentParameterRepository.existsByCompanyIdAndName(companyId, request.getName())) {
            throw new IllegalArgumentException("Assessment parameter with this name already exists");
        }

        AssessmentParameter parameter = AssessmentParameter.builder()
                .companyId(companyId)
                .name(request.getName())
                .description(request.getDescription())
                .maxScore(request.getMaxScore() != null ? request.getMaxScore() : 5)
                .weight(request.getWeight() != null ? request.getWeight() : BigDecimal.ONE)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        AssessmentParameter saved = assessmentParameterRepository.save(parameter);
        return mapParameterToResponse(saved);
    }

    /**
     * Update an assessment parameter
     */
    public AssessmentParameterResponse updateAssessmentParameter(Long companyId, Long parameterId, UpdateAssessmentParameterRequest request) {
        AssessmentParameter parameter = assessmentParameterRepository.findById(parameterId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment parameter not found"));

        if (!parameter.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("Assessment parameter does not belong to this company");
        }

        // Check for duplicate name if changing name
        if (request.getName() != null && !request.getName().equals(parameter.getName())) {
            if (assessmentParameterRepository.existsByCompanyIdAndNameAndIdNot(companyId, request.getName(), parameterId)) {
                throw new IllegalArgumentException("Assessment parameter with this name already exists");
            }
            parameter.setName(request.getName());
        }

        if (request.getDescription() != null) {
            parameter.setDescription(request.getDescription());
        }
        if (request.getMaxScore() != null) {
            if (request.getMaxScore() <= 0) {
                throw new IllegalArgumentException("Max score must be positive");
            }
            parameter.setMaxScore(request.getMaxScore());
        }
        if (request.getWeight() != null) {
            if (request.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Weight must be positive");
            }
            parameter.setWeight(request.getWeight());
        }
        if (request.getDisplayOrder() != null) {
            parameter.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsActive() != null) {
            parameter.setIsActive(request.getIsActive());
        }

        parameter.setUpdatedAt(LocalDateTime.now());
        AssessmentParameter saved = assessmentParameterRepository.save(parameter);
        return mapParameterToResponse(saved);
    }

    /**
     * Delete an assessment parameter
     */
    public void deleteAssessmentParameter(Long companyId, Long parameterId) {
        AssessmentParameter parameter = assessmentParameterRepository.findById(parameterId)
                .orElseThrow(() -> new IllegalArgumentException("Assessment parameter not found"));

        if (!parameter.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("Assessment parameter does not belong to this company");
        }

        assessmentParameterRepository.delete(parameter);
    }

    /**
     * Map CompanySettings entity to response DTO
     */
    private CompanySettingsResponse mapToResponse(CompanySettings settings, List<AssessmentParameter> parameters) {
        List<AssessmentParameterResponse> parameterResponses = parameters.stream()
                .map(this::mapParameterToResponse)
                .collect(Collectors.toList());

        return CompanySettingsResponse.builder()
                .id(settings.getId())
                .companyId(settings.getCompanyId())
                .autoScoreWeight(settings.getAutoScoreWeight())
                .manualScoreWeight(settings.getManualScoreWeight())
                .dataRetentionDays(settings.getDataRetentionDays())
                .defaultSessionTimeoutMinutes(settings.getDefaultSessionTimeoutMinutes())
                .scoreExceptionalThreshold(settings.getScoreExceptionalThreshold())
                .scoreStrongThreshold(settings.getScoreStrongThreshold())
                .scoreGoodThreshold(settings.getScoreGoodThreshold())
                .scoreConcerningThreshold(settings.getScoreConcerningThreshold())
                .assessmentParameters(parameterResponses)
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }

    /**
     * Map AssessmentParameter entity to response DTO
     */
    private AssessmentParameterResponse mapParameterToResponse(AssessmentParameter parameter) {
        return AssessmentParameterResponse.builder()
                .id(parameter.getId())
                .companyId(parameter.getCompanyId())
                .name(parameter.getName())
                .description(parameter.getDescription())
                .maxScore(parameter.getMaxScore())
                .weight(parameter.getWeight())
                .displayOrder(parameter.getDisplayOrder())
                .isActive(parameter.getIsActive())
                .createdAt(parameter.getCreatedAt())
                .updatedAt(parameter.getUpdatedAt())
                .build();
    }
}
