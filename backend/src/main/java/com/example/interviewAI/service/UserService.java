package com.example.interviewAI.service;

import com.example.interviewAI.dto.UserResponse;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToUserResponse(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToUserResponse(user);
    }

    public List<UserResponse> getUsersByCompany(Long companyId) {
        List<User> users = userRepository.findByCompanyId(companyId);
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getInterviewersByCompany(Long companyId) {
        List<User> users = userRepository.findInterviewersByCompany(companyId, RoleEnum.INTERVIEWER);
        return users.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse addInterviewer(Long companyId, String email, String name, String password) {
        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Check if company exists
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        // Create interviewer user
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setName(name);
        user.setRole(RoleEnum.INTERVIEWER);
        user.setCompany(company);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, RoleEnum role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(role);
        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }

    public boolean isUserCompanyOwner(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getRole() == RoleEnum.ADMIN &&
               user.getCompany() != null &&
               user.getCompany().getId().equals(companyId);
    }

    public boolean isUserCompanyMember(Long userId, Long companyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getCompany() != null && user.getCompany().getId().equals(companyId);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole().getValue());
        response.setCompanyId(user.getCompany() != null ? user.getCompany().getId() : null);
        response.setCreatedAt(user.getCreatedAt());
        response.setLastLogin(user.getLastLogin());
        return response;
    }
}
