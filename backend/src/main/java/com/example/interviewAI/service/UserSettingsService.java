package com.example.interviewAI.service;

import com.example.interviewAI.entity.UserSettings;
import com.example.interviewAI.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserSettingsService {
    private final UserSettingsRepository userSettingsRepository;

    /**
     * Get or create user settings
     */
    public UserSettings getOrCreateSettings(Long userId) {
        return userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings settings = UserSettings.builder()
                            .userId(userId)
                            .showRunTests(true)
                            .autoScoreWeight(50)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return userSettingsRepository.save(settings);
                });
    }

    /**
     * Update user settings
     */
    public UserSettings updateSettings(Long userId, UserSettings settings) {
        UserSettings existing = getOrCreateSettings(userId);

        // Only update fields that are not null
        if (settings.getDefaultAgentId() != null) {
            existing.setDefaultAgentId(settings.getDefaultAgentId());
        }
        if (settings.getShowRunTests() != null) {
            existing.setShowRunTests(settings.getShowRunTests());
        }
        if (settings.getAutoScoreWeight() != null) {
            existing.setAutoScoreWeight(settings.getAutoScoreWeight());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return userSettingsRepository.save(existing);
    }

    /**
     * Update default agent
     */
    public UserSettings updateDefaultAgent(Long userId, Long agentId) {
        UserSettings settings = getOrCreateSettings(userId);
        settings.setDefaultAgentId(agentId);
        settings.setUpdatedAt(LocalDateTime.now());
        return userSettingsRepository.save(settings);
    }

    /**
     * Update show run tests preference
     */
    public UserSettings updateShowRunTests(Long userId, Boolean enabled) {
        UserSettings settings = getOrCreateSettings(userId);
        settings.setShowRunTests(enabled);
        settings.setUpdatedAt(LocalDateTime.now());
        return userSettingsRepository.save(settings);
    }

    /**
     * Update scoring weight
     */
    public UserSettings updateAutoScoreWeight(Long userId, Integer weight) {
        if (weight < 0 || weight > 100) {
            throw new IllegalArgumentException("Auto score weight must be between 0 and 100");
        }
        UserSettings settings = getOrCreateSettings(userId);
        settings.setAutoScoreWeight(weight);
        settings.setUpdatedAt(LocalDateTime.now());
        return userSettingsRepository.save(settings);
    }
}
