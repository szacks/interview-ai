package com.example.interviewAI.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping("/alive")
    public ResponseEntity<?> alive() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Server is alive and running");
        response.put("timestamp", LocalDateTime.now());
        response.put("uptime", "running");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "InterviewAI API");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "InterviewAI");
        return ResponseEntity.ok(response);
    }
}
