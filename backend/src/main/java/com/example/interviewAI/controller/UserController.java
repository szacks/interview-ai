package com.example.interviewAI.controller;

import com.example.interviewAI.dto.UserResponse;
import com.example.interviewAI.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user management operations.
 * Handles user retrieval and filtering.
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get user by ID.
     *
     * @param userId user identifier
     * @return user details
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        log.debug("Fetching user with ID: {}", userId);
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by email.
     *
     * @param email user email
     * @return user details
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        log.debug("Fetching user with email: {}", email);
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    /**
     * Get all users for a company.
     *
     * @param companyId company identifier
     * @return list of users in the company
     */
    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<UserResponse>> getUsersByCompany(@PathVariable Long companyId) {
        log.debug("Fetching users for company ID: {}", companyId);
        List<UserResponse> users = userService.getUsersByCompany(companyId);
        return ResponseEntity.ok(users);
    }

    /**
     * Get all interviewers for a company.
     *
     * @param companyId company identifier
     * @return list of interviewers in the company
     */
    @GetMapping("/company/{companyId}/interviewers")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<UserResponse>> getInterviewersByCompany(@PathVariable Long companyId) {
        log.debug("Fetching interviewers for company ID: {}", companyId);
        List<UserResponse> interviewers = userService.getInterviewersByCompany(companyId);
        return ResponseEntity.ok(interviewers);
    }
}

