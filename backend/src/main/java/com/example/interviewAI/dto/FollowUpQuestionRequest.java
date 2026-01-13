package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating follow-up questions.
 * Follow-up questions are guidance questions for interviewers to assess deeper understanding.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpQuestionRequest {
    private Long id;  // Optional for updates, omitted for new questions
    private String question;
    private String answer;
    private Integer orderIndex;
}
