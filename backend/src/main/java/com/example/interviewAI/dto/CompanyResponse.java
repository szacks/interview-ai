package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {

    private Long id;

    private String name;

    private String email;

    private String subscriptionTier;

    private String logoUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
