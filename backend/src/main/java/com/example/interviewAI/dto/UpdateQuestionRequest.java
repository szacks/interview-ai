package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * DTO for updating an existing question.
 * All fields are optional to support partial updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateQuestionRequest {

    // Question ID being updated
    private Long id;

    // ========== Step 1: Basic Info ==========
    private String title;
    private String category;
    private String difficulty;
    private String shortDescription;
    private Integer timeLimitMinutes;

    // ========== Step 2: Problem Description ==========
    private String description;

    // ========== Step 3: Initial Code ==========
    private String primaryLanguage;
    private String initialCodeJava;
    private String initialCodePython;
    private String initialCodeJavascript;
    private Map<String, Map<String, Boolean>> generatedLanguages;

    // ========== Step 4: Test Cases ==========
    private String testsJson;

    // ========== Step 5: AI Configuration + Follow-up Questions ==========
    private String aiPromptTemplate;
    private String aiCustomPrompt;
    private String aiHelperName;
    private String followupQuestionsJson;

    // ========== Step 7: Publish ==========
    private String status; // 'DRAFT' or 'PUBLISHED'

    // ========== Draft Progress Tracking ==========
    private Integer currentStep; // Current step in the wizard (1-7)

    // ========== Optional: Company-specific question ==========
    private Long companyId;
}
