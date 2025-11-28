package com.example.interviewAI.service;

import com.example.interviewAI.dto.LoginRequest;
import com.example.interviewAI.dto.SignupRequest;
import com.example.interviewAI.dto.AuthResponse;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.repository.CompanyRepository;
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
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new company and admin user
     */
    public AuthResponse signup(SignupRequest request) {
        // Check if company email already exists
        if (companyRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Company with this email already exists");
        }

        // Check if user email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists");
        }

        // Create new company
        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setEmail(request.getEmail());
        company.setSubscriptionTier("starter");
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        company = companyRepository.save(company);

        // Create admin user for the company
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getCompanyName()); // Use company name as initial admin name
        user.setRole("admin");
        user.setCompany(company);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        log.info("New user registered: {} for company: {}", user.getEmail(), company.getName());

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return buildAuthResponse(user, token);
    }

    /**
     * Authenticate user and generate token
     */
    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Update last login time
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail());

        return buildAuthResponse(user, token);
    }

    /**
     * Build AuthResponse from User and token
     */
    private AuthResponse buildAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        if (user.getCompany() != null) {
            response.setCompanyId(user.getCompany().getId());
        }
        response.setToken(token);
        response.setExpiresIn(3600L); // 1 hour in seconds
        response.setMessage("Login successful");

        return response;
    }

    /**
     * Get current user by ID
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    /**
     * Validate password reset token and reset password
     */
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset for user: {}", user.getEmail());
    }
}
