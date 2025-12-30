package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateInterviewRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    // Language is accepted but not used during interview creation
    // It will be set when the candidate submits setup via /ready endpoint
    private String language;

    private LocalDateTime scheduledAt;

    private Long interviewerId;
}
