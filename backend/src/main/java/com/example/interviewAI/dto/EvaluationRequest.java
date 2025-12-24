package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequest {

    @NotNull(message = "Interview ID is required")
    private Long interviewId;

    // Auto Score adjustment (optional)
    @Min(value = 0, message = "Auto score must be between 0 and 100")
    @Max(value = 100, message = "Auto score must be between 0 and 100")
    private Integer autoScoreAdjusted;
    private String autoScoreAdjustedReason;

    // Manual Scores (4 parameters)
    @Min(value = 0, message = "Communication score must be between 0 and 10")
    @Max(value = 10, message = "Communication score must be between 0 and 10")
    private Integer manualScoreCommunication;

    @Min(value = 0, message = "Algorithmic score must be between 0 and 10")
    @Max(value = 10, message = "Algorithmic score must be between 0 and 10")
    private Integer manualScoreAlgorithmic;

    @Min(value = 0, message = "Problem solving score must be between 0 and 10")
    @Max(value = 10, message = "Problem solving score must be between 0 and 10")
    private Integer manualScoreProblemSolving;

    @Min(value = 0, message = "AI collaboration score must be between 0 and 10")
    @Max(value = 10, message = "AI collaboration score must be between 0 and 10")
    private Integer manualScoreAiCollaboration;

    // Notes for each parameter
    private String notesCommunication;
    private String notesAlgorithmic;
    private String notesProblemSolving;
    private String notesAiCollaboration;

    // Custom observations
    private String customObservations;

    // Draft mode
    private Boolean isDraft;
}
