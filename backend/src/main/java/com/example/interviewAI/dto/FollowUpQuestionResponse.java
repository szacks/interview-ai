package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpQuestionResponse {
    private Long id;
    private String question;
    private String goodAnswer;
    private String greatAnswer;
    private Integer orderIndex;
}
