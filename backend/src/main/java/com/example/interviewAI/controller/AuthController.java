package com.example.interviewAI.controller;

import com.example.interviewAI.dto.AcceptInvitationRequest;
import com.example.interviewAI.dto.AuthResponse;
import com.example.interviewAI.dto.LoginRequest;
import com.example.interviewAI.dto.PasswordResetRequest;
import com.example.interviewAI.dto.ResetPasswordRequest;
import com.example.interviewAI.dto.SignupRequest;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.service.AuthService;
import com.example.interviewAI.service.InvitationService;
import com.example.interviewAI.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST controller for authentication and authorization operations.
 * Handles user signup, login, password reset, and invitation acceptance.
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final InvitationService invitationService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new company and admin user.
     *
     * @param signupRequest signup details including company and user information
     * @return authentication response with JWT token
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        log.info("Signup request received for email: {}", signupRequest.getEmail());
        AuthResponse response = authService.signup(signupRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Authenticate a user and generate JWT token.
     *
     * @param loginRequest login credentials
     * @return authentication response with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for email: {}", loginRequest.getEmail());
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate a JWT token and return user information.
     *
     * @param bearerToken JWT token from Authorization header
     * @return authentication response with user details
     */
    @GetMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(@RequestHeader("Authorization") String bearerToken) {
        log.debug("Token validation request received");
        String token = bearerToken.replace("Bearer ", "");
        AuthResponse response = authService.validateToken(token);
        return ResponseEntity.ok(response);
    }

    /**
     * Initiate password reset process by sending reset email.
     *
     * @param request password reset request with user email
     * @return response confirming email sent
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset request received for email: {}", request.getEmail());
        AuthResponse response = authService.requestPasswordReset(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Reset user password using reset token.
     *
     * @param request reset password request with token and new password
     * @return response confirming password reset
     */
    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset confirmation received");
        AuthResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Accept team invitation and create user account.
     *
     * @param request invitation acceptance details with token, password, and name
     * @return authentication response with JWT token
     */
    @PostMapping("/accept-invitation")
    public ResponseEntity<AuthResponse> acceptInvitation(@Valid @RequestBody AcceptInvitationRequest request) {
        log.info("Invitation acceptance request received");
        User user = invitationService.acceptInvitation(request.getToken(), request.getPassword(), request.getName());

        // Generate token for the new user
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().getValue());

        // Build response
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setToken(token);
        response.setExpiresIn(86400000L); // 24 hours in milliseconds
        response.setMessage("Invitation accepted successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
