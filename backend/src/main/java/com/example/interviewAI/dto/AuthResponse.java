package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private Long userId;

    private String name;

    private String email;

    private String role;

    private Long companyId;

    private String token;

    private Long expiresIn;

    private String message;
}
