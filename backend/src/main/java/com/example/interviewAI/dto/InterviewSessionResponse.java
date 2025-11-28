package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSessionResponse {

    private Long id;

    private Long interviewId;

    private String codeSnapshot;

    private String language;

    private String conversationLog;

    private String testResults;

    private Integer automatedScore;

    private Integer manualScore;

    private Integer finalScore;

    private String interviewerNotes;

    private String recommendation;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
