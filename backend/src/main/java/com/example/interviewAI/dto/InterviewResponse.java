package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {

    private Long id;

    private Long companyId;

    private Long questionId;

    private Long candidateId;

    private Long interviewerId;

    private String language;

    private String status;

    private LocalDateTime scheduledAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String interviewLinkToken;

    private LocalDateTime createdAt;

    private QuestionResponse question;

    private CandidateResponse candidate;

    private UserResponse interviewer;

    private CompanyResponse company;
}
