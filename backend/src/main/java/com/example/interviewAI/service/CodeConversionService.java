package com.example.interviewAI.service;

import com.example.interviewAI.config.ClaudeProperties;
import com.example.interviewAI.dto.CodeConversionRequest;
import com.example.interviewAI.dto.CodeConversionResponse;
import com.example.interviewAI.dto.ClaudeEvaluationRequest;
import com.example.interviewAI.dto.ClaudeEvaluationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service for converting code between programming languages using Claude AI.
 * Used in Step 3 of the question builder when "Generate Other Languages" is clicked.
 */
@Slf4j
@Service
public class CodeConversionService {

    @Autowired
    private ClaudeProperties claudeProperties;

    @Autowired
    private RestTemplate restTemplate;

    /**
     * Convert code from one language to another using Claude AI
     */
    public CodeConversionResponse convertCode(CodeConversionRequest request) {
        log.info("Converting code from {} to {}", request.getSourceLanguage(), request.getTargetLanguage());

        try {
            // Validate languages
            if (!request.isValidLanguagePair()) {
                return CodeConversionResponse.failure(
                        request.getTargetLanguage(),
                        "Invalid language pair. Source and target must be different and valid languages (java, python, javascript)"
                );
            }

            // Build conversion prompt
            String conversionPrompt = buildCodeConversionPrompt(
                    request.getSourceLanguage(),
                    request.getTargetLanguage(),
                    request.getSourceCode()
            );

            // Call Claude API
            ClaudeEvaluationResponse response = callClaudeAPI(conversionPrompt);

            if (response == null || response.getContent() == null || response.getContent().isEmpty()) {
                log.warn("Empty response from Claude API for code conversion");
                return CodeConversionResponse.failure(
                        request.getTargetLanguage(),
                        "Empty response from Claude API"
                );
            }

            // Extract converted code from response
            String responseText = response.getContent().get(0).getText();
            String convertedCode = extractConvertedCode(responseText);

            if (convertedCode == null || convertedCode.trim().isEmpty()) {
                log.warn("Could not extract converted code from Claude response");
                return CodeConversionResponse.failure(
                        request.getTargetLanguage(),
                        "Failed to extract converted code from Claude response"
                );
            }

            log.info("Code conversion successful from {} to {}", request.getSourceLanguage(), request.getTargetLanguage());
            return CodeConversionResponse.success(request.getTargetLanguage(), convertedCode);

        } catch (Exception e) {
            log.error("Error converting code from {} to {}: {}",
                    request.getSourceLanguage(),
                    request.getTargetLanguage(),
                    e.getMessage(),
                    e);
            return CodeConversionResponse.failure(
                    request.getTargetLanguage(),
                    "Error during code conversion: " + e.getMessage()
            );
        }
    }

    /**
     * Build the code conversion prompt for Claude
     */
    private String buildCodeConversionPrompt(String sourceLanguage, String targetLanguage, String sourceCode) {
        return String.format("""
                You are an expert programmer specializing in code translation between programming languages.

                Your task is to convert the following %s code to %s, maintaining the exact same functionality and structure.

                ## Guidelines:
                - Preserve all logic and behavior exactly as in the source code
                - Use language-specific idioms and best practices for the target language
                - Maintain the same function/method signatures and names where possible
                - Preserve meaningful comments that explain the logic (like TODO comments)
                - Remove any prefix comments (like "// ex:", "# ex:") from the source code
                - If the source uses language-specific features, translate them appropriately
                - Do NOT add new features or change the implementation logic
                - Do NOT add comprehensive error handling unless present in source

                ## Source Code (%s):
                ```%s
                %s
                ```

                ## Output Requirements:
                - Provide ONLY the converted code in a single code block
                - Start with ```%s and end with ```
                - Remove any prefix comments like "// ex:" or "# ex:" that appear in the source
                - Include only meaningful comments (like TODO or implementation notes)
                - No explanation, comments, or additional text before or after the code block
                - The code must be syntactically correct and ready to use
                - Ensure the output format matches the target language syntax exactly

                ## Converted Code (%s):
                """,
                sourceLanguage,
                targetLanguage,
                sourceLanguage,
                sourceLanguage,
                sourceCode,
                targetLanguage,
                targetLanguage
        );
    }

    /**
     * Extract the converted code from Claude's response
     */
    private String extractConvertedCode(String responseText) {
        try {
            // Try to find code within triple backticks
            Pattern pattern = Pattern.compile("```(?:[a-z]*\\n)?([\\s\\S]*?)```");
            Matcher matcher = pattern.matcher(responseText);

            if (matcher.find()) {
                String code = matcher.group(1);
                // Remove language specifier if present (e.g., "```java" at the start)
                code = code.replaceAll("^[a-z]+\\n", "");
                code = cleanupPrefixComments(code);
                return code.trim();
            }

            // If no code block found, try to use the entire response if it looks like code
            if (responseText.trim().length() > 20) {
                String code = cleanupPrefixComments(responseText.trim());
                return code.trim();
            }

            log.warn("Could not extract code from Claude response. Response text: {}", responseText);
            return null;

        } catch (Exception e) {
            log.error("Error extracting converted code from response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Remove prefix comments like "# ex:" or "// ex:" from code lines
     */
    private String cleanupPrefixComments(String code) {
        StringBuilder cleaned = new StringBuilder();
        String[] lines = code.split("\n");

        for (String line : lines) {
            String processedLine = line;

            // Remove "# ex:" prefix for Python
            if (line.trim().startsWith("# ex:")) {
                processedLine = line.replaceFirst("^\\s*#\\s*ex:\\s*", "");
            }
            // Remove "// ex:" prefix for Java/JavaScript
            else if (line.trim().startsWith("// ex:")) {
                processedLine = line.replaceFirst("^\\s*//\\s*ex:\\s*", "");
            }

            // Only skip lines that are completely empty after cleanup
            if (!processedLine.trim().isEmpty() || line.trim().isEmpty()) {
                cleaned.append(processedLine).append("\n");
            }
        }

        return cleaned.toString();
    }

    /**
     * Call Claude API with the conversion prompt
     */
    private ClaudeEvaluationResponse callClaudeAPI(String prompt) {
        try {
            // Validate API key is configured
            if (claudeProperties.getApiKey() == null || claudeProperties.getApiKey().isEmpty()) {
                log.error("CLAUDE_API_KEY environment variable is not set. Code conversion will not work.");
                return null;
            }

            // Prepare request
            ClaudeEvaluationRequest request = buildClaudeRequest(prompt);

            String apiUrl = claudeProperties.getApiUrl() + "/messages";
            log.debug("Calling Claude API for code conversion at: {}", apiUrl);

            // Make API call
            ClaudeEvaluationResponse response = restTemplate.postForObject(
                    apiUrl,
                    createHttpEntity(request),
                    ClaudeEvaluationResponse.class
            );

            log.debug("Claude API call successful for code conversion");
            return response;

        } catch (Exception e) {
            log.error("Error calling Claude API for code conversion: {} - {}",
                    e.getClass().getSimpleName(),
                    e.getMessage(),
                    e);
            return null;
        }
    }

    /**
     * Build Claude API request
     */
    private ClaudeEvaluationRequest buildClaudeRequest(String prompt) {
        List<ClaudeEvaluationRequest.ClaudeMessage> messages = new ArrayList<>();
        messages.add(ClaudeEvaluationRequest.ClaudeMessage.builder()
                .role("user")
                .content(prompt)
                .build());

        return ClaudeEvaluationRequest.builder()
                .model(claudeProperties.getModel())
                .maxTokens(claudeProperties.getMaxTokens())
                .temperature(0.3) // Lower temperature for more consistent code conversion
                .messages(messages)
                .build();
    }

    /**
     * Create HTTP entity with proper headers for Claude API
     */
    private org.springframework.http.HttpEntity<ClaudeEvaluationRequest> createHttpEntity(
            ClaudeEvaluationRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", claudeProperties.getApiKey());
        headers.set("anthropic-version", "2023-06-01");

        return new org.springframework.http.HttpEntity<>(request, headers);
    }
}
