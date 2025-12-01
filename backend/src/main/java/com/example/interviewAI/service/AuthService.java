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
import com.example.interviewAI.exception.BadRequestException;
import com.example.interviewAI.exception.ConflictException;
import com.example.interviewAI.exception.ResourceNotFoundException;
import com.example.interviewAI.exception.UnauthorizedException;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.PasswordResetTokenRepository;
import com.example.interviewAI.repository.UserRepository;
import com.example.interviewAI.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service for handling authentication and authorization operations.
 * Manages user signup, login, password reset, and token validation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final long TOKEN_EXPIRY_MS = 86400000L; // 24 hours

    /**
     * Register a new company and admin user.
     *
     * @param signupRequest signup details including company and user information
     * @return authentication response with JWT token
     * @throws ConflictException if user with email already exists
     */
    @Transactional
    public AuthResponse signup(SignupRequest signupRequest) {
        log.info("Processing signup request for email: {}", signupRequest.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new ConflictException("User with this email already exists");
        }

        // Create company
        Company company = createCompany(signupRequest);

        // Create admin user
        User user = createAdminUser(signupRequest, company);

        // Generate authentication token
        String token = generateToken(user);

        log.info("Signup successful for user: {}", user.getEmail());
        return buildAuthResponse(user, token, "Signup successful");
    }

    /**
     * Create a new company entity.
     */
    private Company createCompany(SignupRequest signupRequest) {
        Company company = new Company();
        company.setName(signupRequest.getCompanyName());
        company.setEmail(signupRequest.getEmail());
        company.setCreatedAt(LocalDateTime.now());
        company.setUpdatedAt(LocalDateTime.now());
        return companyRepository.save(company);
    }

    /**
     * Create a new admin user entity.
     */
    private User createAdminUser(SignupRequest signupRequest, Company company) {
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signupRequest.getPassword()));
        user.setName(signupRequest.getAdminName());
        user.setRole(RoleEnum.ADMIN);
        user.setCompany(company);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Authenticate a user and generate JWT token.
     *
     * @param loginRequest login credentials
     * @return authentication response with JWT token
     * @throws UnauthorizedException if credentials are invalid
     */
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Processing login request for email: {}", loginRequest.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate authentication token
        String token = generateToken(user);

        log.info("Login successful for user: {}", user.getEmail());
        return buildAuthResponse(user, token, "Login successful");
    }

    /**
     * Validate a JWT token and return user information.
     *
     * @param token JWT token to validate
     * @return authentication response with user details
     * @throws UnauthorizedException if token is invalid
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public AuthResponse validateToken(String token) {
        log.debug("Validating token");

        if (!jwtTokenProvider.validateToken(token)) {
            throw new UnauthorizedException("Invalid token");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return buildAuthResponse(user, null, "Token is valid");
    }

    /**
     * Initiate password reset process by sending reset email.
     *
     * @param request password reset request with user email
     * @return response confirming email sent
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional
    public AuthResponse requestPasswordReset(PasswordResetRequest request) {
        log.info("Processing password reset request for email: {}", request.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Create password reset token
        PasswordResetToken resetToken = PasswordResetToken.create(user);
        passwordResetTokenRepository.save(resetToken);

        // Send password reset email
        emailService.sendPasswordResetEmail(
                user.getEmail(),
                user.getName(),
                resetToken.getToken()
        );

        log.info("Password reset email sent to: {}", user.getEmail());

        // Return response
        AuthResponse response = new AuthResponse();
        response.setMessage("Password reset link has been sent to your email");
        response.setEmail(user.getEmail());
        return response;
    }

    /**
     * Reset user password using reset token.
     *
     * @param request reset password request with token and new password
     * @return response confirming password reset
     * @throws BadRequestException if token is invalid, expired, or already used
     */
    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        log.info("Processing password reset confirmation");

        // Find password reset token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        // Validate token
        validateResetToken(resetToken);

        // Get user and update password
        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.markAsUsed();
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());

        return buildAuthResponse(user, null, "Password reset successful");
    }

    /**
     * Validate password reset token.
     *
     * @param resetToken token to validate
     * @throws BadRequestException if token is invalid
     */
    private void validateResetToken(PasswordResetToken resetToken) {
        if (!resetToken.isValid()) {
            if (resetToken.isUsed()) {
                throw new BadRequestException("Password reset token has already been used");
            } else {
                throw new BadRequestException("Password reset token has expired");
            }
        }
    }

    /**
     * Generate JWT token for user.
     *
     * @param user user to generate token for
     * @return JWT token string
     */
    private String generateToken(User user) {
        return jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getValue()
        );
    }

    /**
     * Build authentication response DTO.
     *
     * @param user user entity
     * @param token JWT token (optional)
     * @param message response message
     * @return authentication response
     */
    private AuthResponse buildAuthResponse(User user, String token, String message) {
        AuthResponse response = new AuthResponse();
        response.setUserId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setMessage(message);

        if (token != null) {
            response.setToken(token);
            response.setExpiresIn(TOKEN_EXPIRY_MS);
        }

        return response;
    }
}

