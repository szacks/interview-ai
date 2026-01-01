package com.example.interviewAI.controller;

import com.example.interviewAI.dto.HealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * REST controller for health check endpoints.
 * Provides service health and status information.
 */
@Slf4j
@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    @Value("${spring.application.name:InterviewAI}")
    private String serviceName;

    @Value("${app.version:1.0.0}")
    private String version;

    @GetMapping("/alive")
    public ResponseEntity<HealthResponse> alive() {
        return ResponseEntity.ok(HealthResponse.builder()
                .status("OK")
                .message("Server is alive and running")
                .timestamp(LocalDateTime.now())
                .uptime("running")
                .build());
    }

    @GetMapping("/status")
    public ResponseEntity<HealthResponse> status() {
        return ResponseEntity.ok(HealthResponse.builder()
                .status("UP")
                .service(serviceName + " API")
                .version(version)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(HealthResponse.builder()
                .status("healthy")
                .service(serviceName)
                .build());
    }
}
