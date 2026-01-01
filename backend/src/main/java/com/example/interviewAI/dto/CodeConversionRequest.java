package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO for requesting AI-powered code conversion between programming languages.
 * Used in Step 3 of the question builder when "Generate Other Languages" is clicked.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeConversionRequest {

    @NotBlank(message = "Source language is required")
    private String sourceLanguage; // 'java', 'python', 'javascript'

    @NotBlank(message = "Target language is required")
    private String targetLanguage; // 'java', 'python', 'javascript'

    @NotBlank(message = "Source code is required")
    private String sourceCode; // The code to convert

    /**
     * Validation helper
     */
    public boolean isValidLanguagePair() {
        String[] validLanguages = {"java", "python", "javascript"};

        boolean sourceValid = false;
        boolean targetValid = false;

        for (String lang : validLanguages) {
            if (lang.equals(sourceLanguage)) sourceValid = true;
            if (lang.equals(targetLanguage)) targetValid = true;
        }

        // Source and target should be different
        return sourceValid && targetValid && !sourceLanguage.equals(targetLanguage);
    }
}
