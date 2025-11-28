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

    @NotNull(message = "Interview session ID is required")
    private Long interviewSessionId;

    @Min(value = 0, message = "Understanding score must be between 0 and 100")
    @Max(value = 100, message = "Understanding score must be between 0 and 100")
    private Integer understandingScore;

    @Min(value = 0, message = "Problem solving score must be between 0 and 100")
    @Max(value = 100, message = "Problem solving score must be between 0 and 100")
    private Integer problemSolvingScore;

    @Min(value = 0, message = "AI collaboration score must be between 0 and 100")
    @Max(value = 100, message = "AI collaboration score must be between 0 and 100")
    private Integer aiCollaborationScore;

    @Min(value = 0, message = "Communication score must be between 0 and 100")
    @Max(value = 100, message = "Communication score must be between 0 and 100")
    private Integer communicationScore;

    private String strengths;

    private String weaknesses;
}
