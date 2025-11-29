package com.example.interviewAI.controller;

import com.example.interviewAI.dto.UserResponse;
import com.example.interviewAI.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<UserResponse>> getUsersByCompany(@PathVariable Long companyId) {
        List<UserResponse> users = userService.getUsersByCompany(companyId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/company/{companyId}/interviewers")
    @PreAuthorize("hasAnyRole('ADMIN', 'INTERVIEWER')")
    public ResponseEntity<List<UserResponse>> getInterviewersByCompany(@PathVariable Long companyId) {
        List<UserResponse> interviewers = userService.getInterviewersByCompany(companyId);
        return ResponseEntity.ok(interviewers);
    }
}
