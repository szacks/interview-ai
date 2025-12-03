package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationResultDto {
    private Integer understandingScore;
    private Integer problemSolvingScore;
    private Integer aiCollaborationScore;
    private Integer communicationScore;
    private String strengths;
    private String weaknesses;
}
