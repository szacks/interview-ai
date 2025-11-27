package com.example.interviewAI.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "claude")
@Data
public class ClaudeProperties {
    private String apiKey;
    private String model;
    private String apiUrl;
    private int maxTokens;
    private double temperature;
}
