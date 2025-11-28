package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse {

    private Long id;

    private Long interviewSessionId;

    private Integer understandingScore;

    private Integer problemSolvingScore;

    private Integer aiCollaborationScore;

    private Integer communicationScore;

    private String strengths;

    private String weaknesses;

    private LocalDateTime createdAt;

    private InterviewSessionResponse interviewSession;
}
