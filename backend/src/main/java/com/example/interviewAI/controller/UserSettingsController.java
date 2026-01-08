package com.example.interviewAI.controller;

import com.example.interviewAI.dto.UpdateUserSettingsRequest;
import com.example.interviewAI.dto.UserSettingsResponse;
import com.example.interviewAI.entity.UserSettings;
import com.example.interviewAI.security.JwtTokenProvider;
import com.example.interviewAI.service.UserSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user-settings")
@RequiredArgsConstructor
public class UserSettingsController {
    private final UserSettingsService userSettingsService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get user settings
     */
    @GetMapping
    public ResponseEntity<UserSettingsResponse> getSettings(@RequestHeader("Authorization") String bearerToken) {
        Long userId = extractUserId(bearerToken);
        UserSettings settings = userSettingsService.getOrCreateSettings(userId);
        return ResponseEntity.ok(mapToResponse(settings));
    }

    /**
     * Update user settings
     */
    @PutMapping
    public ResponseEntity<UserSettingsResponse> updateSettings(
            @RequestHeader("Authorization") String bearerToken,
            @RequestBody UpdateUserSettingsRequest request) {
        Long userId = extractUserId(bearerToken);

        UserSettings newSettings = UserSettings.builder()
                .defaultAgentId(request.getDefaultAgentId())
                .showRunTests(request.getShowRunTests())
                .autoScoreWeight(request.getAutoScoreWeight())
                .sessionTimeoutMinutes(request.getSessionTimeoutMinutes())
                .dataRetentionDays(request.getDataRetentionDays())
                .build();

        UserSettings updated = userSettingsService.updateSettings(userId, newSettings);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    /**
     * Update default agent
     */
    @PutMapping("/agent/{agentId}")
    public ResponseEntity<UserSettingsResponse> updateDefaultAgent(
            @RequestHeader("Authorization") String bearerToken,
            @PathVariable Long agentId) {
        Long userId = extractUserId(bearerToken);
        UserSettings updated = userSettingsService.updateDefaultAgent(userId, agentId);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    /**
     * Update run tests preference
     */
    @PutMapping("/run-tests")
    public ResponseEntity<UserSettingsResponse> updateShowRunTests(
            @RequestHeader("Authorization") String bearerToken,
            @RequestParam Boolean enabled) {
        Long userId = extractUserId(bearerToken);
        UserSettings updated = userSettingsService.updateShowRunTests(userId, enabled);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    /**
     * Update auto score weight
     */
    @PutMapping("/scoring/auto-weight")
    public ResponseEntity<UserSettingsResponse> updateAutoScoreWeight(
            @RequestHeader("Authorization") String bearerToken,
            @RequestParam Integer weight) {
        Long userId = extractUserId(bearerToken);
        UserSettings updated = userSettingsService.updateAutoScoreWeight(userId, weight);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    /**
     * Extract user ID from JWT bearer token.
     */
    private Long extractUserId(String bearerToken) {
        if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid or missing authorization token");
        }

        String token = bearerToken.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    private UserSettingsResponse mapToResponse(UserSettings settings) {
        return UserSettingsResponse.builder()
                .id(settings.getId())
                .userId(settings.getUserId())
                .defaultAgentId(settings.getDefaultAgentId())
                .showRunTests(settings.getShowRunTests())
                .autoScoreWeight(settings.getAutoScoreWeight())
                .sessionTimeoutMinutes(settings.getSessionTimeoutMinutes())
                .dataRetentionDays(settings.getDataRetentionDays())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }
}
