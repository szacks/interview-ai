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
    private Long interviewId;

    // Auto Score
    private Integer testsPassed;
    private Integer testsTotal;
    private Integer autoScoreOriginal;
    private Integer autoScoreAdjusted;
    private String autoScoreAdjustedReason;

    // Manual Scores (4 parameters) - each 0-10
    private Integer manualScoreCommunication;
    private Integer manualScoreAlgorithmic;
    private Integer manualScoreProblemSolving;
    private Integer manualScoreAiCollaboration;

    // Notes for each parameter
    private String notesCommunication;
    private String notesAlgorithmic;
    private String notesProblemSolving;
    private String notesAiCollaboration;

    // Custom observations
    private String customObservations;

    // Calculated scores
    private Integer manualScoreTotal;    // Sum of 4 params (0-40)
    private Integer manualScoreNormalized; // Normalized to 0-100
    private Integer finalScore;          // (auto * 0.4) + (manual * 0.6)

    // Status
    private Boolean isDraft;
    private LocalDateTime evaluationSubmittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Interview details for display
    private String candidateName;
    private String questionTitle;
    private String language;
    private Integer duration;
    private String interviewStatus;
}
