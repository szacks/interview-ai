package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Long id;

    private String title;

    private String description;

    private String difficulty;

    private Integer timeLimitMinutes;

    private String supportedLanguages;

    private String requirementsJson;

    private String testsJson;

    private String rubricJson;

    private String intentionalBugsJson;

    private String initialCodeJava;

    private String initialCodePython;

    private String initialCodeJavascript;

    private LocalDateTime createdAt;

    private List<FollowUpQuestionResponse> followUpQuestions;

    private List<TestCaseResponse> testCases;
}
