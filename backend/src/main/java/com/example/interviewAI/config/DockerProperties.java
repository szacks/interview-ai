package com.example.interviewAI.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Docker configuration properties.
 * Externalized Docker settings for flexible deployment.
 */
@Component
@ConfigurationProperties(prefix = "docker")
@Data
public class DockerProperties {
    private String host;
    private Integer maxConnections = 100;
    private Integer connectionTimeoutSeconds = 30;
    private Integer responseTimeoutSeconds = 45;
    private Sandbox sandbox;

    @Data
    public static class Sandbox {
        private Java java;
        private Python python;
        private Node node;

        @Data
        public static class Java {
            private String image;
        }

        @Data
        public static class Python {
            private String image;
        }

        @Data
        public static class Node {
            private String image;
        }
    }
}
