package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberResponse {

    private Long id;

    private String email;

    private String name;

    private String role;

    private LocalDateTime joinedAt;
}
