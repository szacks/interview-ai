package com.example.interviewAI.service;

import com.example.interviewAI.dto.AuthResponse;
import com.example.interviewAI.dto.LoginRequest;
import com.example.interviewAI.dto.PasswordResetRequest;
import com.example.interviewAI.dto.ResetPasswordRequest;
import com.example.interviewAI.dto.SignupRequest;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.PasswordResetToken;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.PasswordResetTokenRepository;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        // Check if user already exists
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Create company
        Company company = new Company();
        company.setName(signupRequest.getCompanyName());
        company.setEmail(signupRequest.getEmail());
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        company = companyRepository.save(company);

        // Create admin user
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));
        user.setName(signupRequest.getAdminName());
        user.setRole(RoleEnum.ADMIN);
        user.setCompany(company);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().getValue());

        // Return response
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(company.getId());
        response.setToken(token);
        response.setExpiresIn(86400000L); // 24 hours in milliseconds
        response.setMessage("Signup successful");

        return response;
    }

    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().getValue());

        // Return response
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setToken(token);
        response.setExpiresIn(86400000L); // 24 hours in milliseconds
        response.setMessage("Login successful");

        return response;
    }

    public AuthResponse validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("Invalid token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setMessage("Token is valid");

        return response;
    }

    @Transactional
    public AuthResponse requestPasswordReset(PasswordResetRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with this email not found"));

        // Create password reset token
        PasswordResetToken resetToken = PasswordResetToken.create(user);
        passwordResetTokenRepository.save(resetToken);

        // Log the reset request
        log.info("Password reset token generated for user: {}", user.getEmail());

        // Send password reset email
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getName(),
                resetToken.getToken()
        );

        // Return response with message
        AuthResponse response = new AuthResponse();
        response.setMessage("Password reset link has been sent to your email");
        response.setEmail(user.getEmail());

        return response;
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        // Find password reset token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid password reset token"));

        // Check if token is valid
        if (!resetToken.isValid()) {
            if (resetToken.isUsed()) {
                throw new IllegalArgumentException("Password reset token has already been used");
            } else {
                throw new IllegalArgumentException("Password reset token has expired");
            }
        }

        // Get user from token
        User user = resetToken.getUser();

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.markAsUsed();
        passwordResetTokenRepository.save(resetToken);

        // Log the password reset
        log.info("Password reset successful for user: {}", user.getEmail());

        // Return response
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setMessage("Password reset successful");

        return response;
    }
}
