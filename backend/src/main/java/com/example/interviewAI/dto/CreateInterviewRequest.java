package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewRequest {

    // Question ID - required
    private Long questionId;

    // Either provide candidateId OR (candidateName + optional role)
    // If candidateId is null, candidateName must be provided
    private Long candidateId;

    // For creating new interviews with candidate info
    private String candidateName;

    // Note: role is accepted from frontend but not stored in Candidate entity
    private String role;

    // Language is accepted but not used during interview creation
    // It will be set when the candidate submits setup via /ready endpoint
    private String language;

    private LocalDateTime scheduledAt;

    private Long interviewerId;
}
