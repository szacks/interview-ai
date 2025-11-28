package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Language is required")
    private String language;

    private LocalDateTime scheduledAt;

    private Long interviewerId;
}
