package com.example.interviewAI.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Security configuration properties.
 * Externalizes public endpoints configuration for better maintainability.
 */
@Component
@ConfigurationProperties(prefix = "app.security")
@Data
public class SecurityProperties {
    /**
     * List of endpoint patterns that should be publicly accessible without authentication.
     * Supports Ant-style path patterns (e.g., /auth/**, /api/public/*)
     */
    private List<String> publicEndpoints;
}
