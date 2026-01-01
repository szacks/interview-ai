package com.example.interviewAI.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for Docker sandbox execution.
 * Externalized for security and flexibility.
 */
@Component
@ConfigurationProperties(prefix = "app.sandbox.execution")
@Data
public class SandboxExecutionProperties {
    /**
     * Maximum execution time in milliseconds
     */
    private Long timeoutMs = 10_000L; // 10 seconds

    /**
     * Memory limit in bytes
     */
    private Long memoryLimitBytes = 128 * 1024 * 1024L; // 128MB

    /**
     * CPU period for quota enforcement (microseconds)
     */
    private Long cpuPeriod = 100_000L; // 100ms

    /**
     * CPU quota (microseconds per period)
     */
    private Long cpuQuota = 50_000L; // 50% of one CPU

    /**
     * Maximum output size in bytes
     */
    private Integer maxOutputBytes = 50_000; // 50KB
}
