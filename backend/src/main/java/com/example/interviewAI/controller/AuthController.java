package com.example.interviewAI.controller;

import com.example.interviewAI.dto.AuthResponse;
import com.example.interviewAI.dto.LoginRequest;
import com.example.interviewAI.dto.PasswordResetRequest;
import com.example.interviewAI.dto.ResetPasswordRequest;
import com.example.interviewAI.dto.SignupRequest;
import com.example.interviewAI.service.AuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            AuthResponse response = authService.signup(signupRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String bearerToken) {
        try {
            String token = bearerToken.replace("Bearer ", "");
            AuthResponse response = authService.validateToken(token);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            AuthResponse response = authService.requestPasswordReset(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            AuthResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
