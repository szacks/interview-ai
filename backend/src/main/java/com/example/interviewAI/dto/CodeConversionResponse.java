package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for the response from AI-powered code conversion.
 * Contains the converted code and status information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeConversionResponse {

    private String targetLanguage; // The language the code was converted to

    private String convertedCode; // The converted source code

    private boolean success; // Whether conversion was successful

    private String error; // Error message if conversion failed

    /**
     * Create a successful response
     */
    public static CodeConversionResponse success(String targetLanguage, String convertedCode) {
        return new CodeConversionResponse(targetLanguage, convertedCode, true, null);
    }

    /**
     * Create a failure response
     */
    public static CodeConversionResponse failure(String targetLanguage, String error) {
        return new CodeConversionResponse(targetLanguage, "", false, error);
    }
}
