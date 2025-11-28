package com.example.interviewAI.controller;

import com.example.interviewAI.dto.LoginRequest;
import com.example.interviewAI.dto.SignupRequest;
import com.example.interviewAI.dto.AuthResponse;
import com.example.interviewAI.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Login attempt for email: {}", request.getEmail());
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Login failed for email: {}", request.getEmail(), e);
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Signup endpoint - Create new company and admin user
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        try {
            log.info("Signup attempt for company: {} with email: {}", request.getCompanyName(), request.getEmail());
            AuthResponse response = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Signup failed for email: {}", request.getEmail(), e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null);
        } catch (Exception e) {
            log.error("Unexpected error during signup", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Get current authenticated user
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            // This endpoint will be used by the frontend to get the current user
            // The user info is extracted from the JWT token by the JwtAuthenticationFilter
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error fetching current user", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Request password reset
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            // TODO: Implement password reset email sending
            log.info("Password reset requested for email: {}", email);
            return ResponseEntity.ok()
                    .body(new MessageResponse("Password reset email sent"));
        } catch (Exception e) {
            log.error("Error requesting password reset", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Reset password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            authService.resetPassword(email, newPassword);
            return ResponseEntity.ok()
                    .body(new MessageResponse("Password reset successful"));
        } catch (RuntimeException e) {
            log.error("Error resetting password", e);
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Password reset failed: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during password reset", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Simple response class for messages
     */
    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
