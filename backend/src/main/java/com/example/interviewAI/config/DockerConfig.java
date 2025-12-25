package com.example.interviewAI.config;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.zerodep.ZerodepDockerHttpClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class DockerConfig {

    private final DockerProperties dockerProperties;

    public DockerConfig(DockerProperties dockerProperties) {
        this.dockerProperties = dockerProperties;
    }

    @Bean
    public DockerClient dockerClient() {
        String dockerHost = dockerProperties.getHost();
        if (dockerHost == null || dockerHost.isEmpty()) {
            dockerHost = "unix:///var/run/docker.sock";
        }

        log.info("Initializing Docker client with host: {}", dockerHost);

        try {
            DefaultDockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                    .withDockerHost(dockerHost)
                    .build();

            // Explicitly create Docker client with zerodep HTTP client
            try {
                com.github.dockerjava.transport.DockerHttpClient httpClient = new ZerodepDockerHttpClient.Builder()
                        .dockerHost(config.getDockerHost())
                        .maxConnections(100)
                        .connectionTimeout(java.time.Duration.ofSeconds(30))
                        .responseTimeout(java.time.Duration.ofSeconds(45))
                        .build();

                DockerClient client = DockerClientImpl.getInstance(config, httpClient);

                // Verify connection
                try {
                    client.pingCmd().exec();
                    log.info("Docker client connected successfully");
                } catch (Exception e) {
                    log.warn("Docker client ping failed - Docker may not be available: {}", e.getMessage());
                }

                return client;
            } catch (Exception e) {
                // Fall back to default initialization if explicit HTTP client setup fails
                log.warn("Failed to explicitly set Docker HTTP client, falling back to default: {}", e.getMessage());
                DockerClient client = DockerClientImpl.getInstance(config);

                try {
                    client.pingCmd().exec();
                    log.info("Docker client connected successfully");
                } catch (Exception ex) {
                    log.warn("Docker client ping failed: {}", ex.getMessage());
                }

                return client;
            }
        } catch (Exception e) {
            log.error("Failed to initialize Docker client", e);
            throw new RuntimeException("Failed to initialize Docker client: " + e.getMessage(), e);
        }
    }
}
