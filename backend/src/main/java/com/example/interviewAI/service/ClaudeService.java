package com.example.interviewAI.service;

import com.example.interviewAI.config.ClaudeProperties;
import com.example.interviewAI.dto.ClaudeEvaluationRequest;
import com.example.interviewAI.dto.ClaudeEvaluationResponse;
import com.example.interviewAI.dto.EvaluationResultDto;
import com.example.interviewAI.entity.ChatMessage;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.repository.InterviewRepository;
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

@Slf4j
@Service
public class ClaudeService {

    @Autowired
    private ClaudeProperties claudeProperties;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private InterviewRepository interviewRepository;

    /**
     * Evaluate interview code submission using Claude AI
     */
    public EvaluationResultDto evaluateCode(String candidateName, String questionTitle, String questionDescription,
                                            String requirementsJson, String codeSubmission, String testResults) {
        try {
            log.info("Starting code evaluation for candidate: {} on question: {}", candidateName, questionTitle);

            // Build the evaluation prompt
            String evaluationPrompt = buildEvaluationPrompt(candidateName, questionTitle, questionDescription,
                    requirementsJson, codeSubmission, testResults);

            // Call Claude API
            ClaudeEvaluationResponse response = callClaudeAPI(evaluationPrompt);

            if (response == null || response.getContent() == null || response.getContent().isEmpty()) {
                log.warn("Empty response from Claude API for candidate: {}", candidateName);
                return getDefaultEvaluation();
            }

            // Extract text from response
            String responseText = response.getContent().get(0).getText();
            log.debug("Claude response text: {}", responseText);

            // Parse the response into evaluation scores
            EvaluationResultDto evaluation = parseEvaluationResponse(responseText);
            log.info("Code evaluation completed for candidate: {} with scores - Understanding: {}, ProblemSolving: {}, " +
                    "AICollaboration: {}, Communication: {}",
                    candidateName, evaluation.getUnderstandingScore(), evaluation.getProblemSolvingScore(),
                    evaluation.getAiCollaborationScore(), evaluation.getCommunicationScore());

            return evaluation;

        } catch (Exception e) {
            log.error("Error evaluating code for candidate: {}", candidateName, e);
            // Return default evaluation on error to not block the interview flow
            return getDefaultEvaluation();
        }
    }

    /**
     * Call Claude API with the evaluation prompt
     */
    private ClaudeEvaluationResponse callClaudeAPI(String prompt) {
        try {
            // Prepare request
            ClaudeEvaluationRequest request = buildClaudeRequest(prompt);

            // Make API call
            ClaudeEvaluationResponse response = restTemplate.postForObject(
                    claudeProperties.getApiUrl() + "/messages",
                    createHttpEntity(request),
                    ClaudeEvaluationResponse.class
            );

            log.debug("Claude API call successful, received response with {} content blocks",
                    response != null && response.getContent() != null ? response.getContent().size() : 0);
            return response;

        } catch (Exception e) {
            log.error("Error calling Claude API: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Build the evaluation prompt for Claude
     */
    private String buildEvaluationPrompt(String candidateName, String questionTitle, String questionDescription,
                                        String requirementsJson, String codeSubmission, String testResults) {
        return String.format("""
                You are an expert software engineering interviewer. Evaluate the following interview submission.

                Candidate Name: %s
                Question: %s
                Description: %s

                Requirements:
                %s

                Candidate's Code Submission:
                ```
                %s
                ```

                Test Results:
                %s

                Please evaluate the candidate on the following criteria and provide scores from 1-10 for each:

                1. **Understanding (1-10)**: How well did the candidate understand the problem requirements?
                2. **Problem Solving (1-10)**: How effective was the candidate's approach to solving the problem?
                3. **AI Collaboration (1-10)**: How well did the candidate accept and implement feedback/suggestions?
                4. **Communication (1-10)**: How clear was the candidate's communication during the interview?

                After scoring, provide:
                - **Strengths**: 2-3 bullet points of what the candidate did well
                - **Weaknesses**: 2-3 bullet points of areas for improvement

                Format your response as follows (IMPORTANT - Use these exact labels):
                UNDERSTANDING_SCORE: [1-10]
                PROBLEM_SOLVING_SCORE: [1-10]
                AI_COLLABORATION_SCORE: [1-10]
                COMMUNICATION_SCORE: [1-10]
                STRENGTHS: [bullet points]
                WEAKNESSES: [bullet points]
                """, candidateName, questionTitle, questionDescription, requirementsJson, codeSubmission, testResults);
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
                .temperature(claudeProperties.getTemperature())
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

    /**
     * Parse Claude's response and extract evaluation scores
     */
    private EvaluationResultDto parseEvaluationResponse(String responseText) {
        try {
            EvaluationResultDto result = new EvaluationResultDto();

            // Extract scores using regex patterns
            result.setUnderstandingScore(extractScore(responseText, "UNDERSTANDING_SCORE"));
            result.setProblemSolvingScore(extractScore(responseText, "PROBLEM_SOLVING_SCORE"));
            result.setAiCollaborationScore(extractScore(responseText, "AI_COLLABORATION_SCORE"));
            result.setCommunicationScore(extractScore(responseText, "COMMUNICATION_SCORE"));

            // Extract strengths and weaknesses
            result.setStrengths(extractSection(responseText, "STRENGTHS"));
            result.setWeaknesses(extractSection(responseText, "WEAKNESSES"));

            log.debug("Parsed evaluation - Understanding: {}, ProblemSolving: {}, AICollaboration: {}, Communication: {}",
                    result.getUnderstandingScore(), result.getProblemSolvingScore(),
                    result.getAiCollaborationScore(), result.getCommunicationScore());

            return result;

        } catch (Exception e) {
            log.error("Error parsing Claude response: {}", e.getMessage());
            return getDefaultEvaluation();
        }
    }

    /**
     * Extract a score from the response text
     */
    private Integer extractScore(String text, String scoreLabel) {
        try {
            Pattern pattern = Pattern.compile(scoreLabel + "\\s*:\\s*(\\d+)");
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                int score = Integer.parseInt(matcher.group(1));
                return Math.min(Math.max(score, 1), 10); // Ensure score is between 1-10
            }
        } catch (Exception e) {
            log.debug("Could not extract {}: {}", scoreLabel, e.getMessage());
        }
        return 5; // Default middle score
    }

    /**
     * Extract a text section from the response
     */
    private String extractSection(String text, String sectionLabel) {
        try {
            Pattern pattern = Pattern.compile(sectionLabel + "\\s*:\\s*(.+?)(?=\\n(?:[A-Z_]+\\s*:|$))", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(text);

            if (matcher.find()) {
                return matcher.group(1).trim();
            }
        } catch (Exception e) {
            log.debug("Could not extract {}: {}", sectionLabel, e.getMessage());
        }
        return "No feedback available";
    }

    /**
     * Get default evaluation scores (fallback)
     */
    private EvaluationResultDto getDefaultEvaluation() {
        return EvaluationResultDto.builder()
                .understandingScore(5)
                .problemSolvingScore(5)
                .aiCollaborationScore(5)
                .communicationScore(5)
                .strengths("Evaluation pending - please review manually")
                .weaknesses("Unable to generate AI evaluation at this time")
                .build();
    }

    /**
     * Generate AI response for a candidate question during live interview
     * @param interviewId ID of the interview
     * @param candidateQuestion The question from the candidate
     * @param conversationHistory Previous messages for context
     * @return AI response text
     */
    public String generateChatResponse(Long interviewId, String candidateQuestion,
                                      List<ChatMessage> conversationHistory) {
        try {
            Interview interview = interviewRepository.findById(interviewId)
                    .orElseThrow(() -> new RuntimeException("Interview not found"));

            // Build system prompt with question context
            String systemPrompt = buildChatSystemPrompt(interview.getQuestion().getTitle(),
                    interview.getQuestion().getDescription());

            // Build conversation history for context
            List<ClaudeEvaluationRequest.ClaudeMessage> messages = buildConversationContext(
                    conversationHistory, candidateQuestion, systemPrompt
            );

            // Build Claude API request
            ClaudeEvaluationRequest request = ClaudeEvaluationRequest.builder()
                    .model(claudeProperties.getModel())
                    .maxTokens(claudeProperties.getMaxTokens())
                    .temperature(claudeProperties.getTemperature())
                    .messages(messages)
                    .build();

            // Call Claude API
            ClaudeEvaluationResponse response = callClaudeAPIWithCustomRequest(request);

            if (response == null || response.getContent() == null || response.getContent().isEmpty()) {
                log.warn("Empty response from Claude API for interview {}", interviewId);
                return "I'm having trouble responding right now. Please try again.";
            }

            String aiResponse = response.getContent().get(0).getText();
            log.debug("Generated chat response for interview {}", interviewId);

            return aiResponse;

        } catch (Exception e) {
            log.error("Error generating chat response for interview {}", interviewId, e);
            return "I apologize, but I'm having trouble responding right now. Please try again.";
        }
    }

    /**
     * Build system prompt for live chat assistance
     */
    private String buildChatSystemPrompt(String questionTitle, String questionDescription) {
        return String.format(
                "You are a helpful AI assistant supporting candidates during coding interviews. " +
                "The candidate is working on: %s\n\n" +
                "Description: %s\n\n" +
                "Your role:\n" +
                "- Provide hints and clarifications when asked\n" +
                "- Help candidates think through problems\n" +
                "- DO NOT give away the solution directly\n" +
                "- Be encouraging and supportive\n" +
                "- Keep responses concise (2-3 sentences when possible)\n" +
                "- If the candidate is stuck, ask guiding questions instead of providing the answer",
                questionTitle, questionDescription
        );
    }

    /**
     * Build conversation context from chat history with system prompt embedded
     */
    private List<ClaudeEvaluationRequest.ClaudeMessage> buildConversationContext(
            List<ChatMessage> history, String newQuestion, String systemPrompt) {

        List<ClaudeEvaluationRequest.ClaudeMessage> messages = new ArrayList<>();

        // Embed system prompt as first user message
        messages.add(ClaudeEvaluationRequest.ClaudeMessage.builder()
                .role("user")
                .content(systemPrompt)
                .build());

        // Add assistant acknowledgment
        messages.add(ClaudeEvaluationRequest.ClaudeMessage.builder()
                .role("assistant")
                .content("I understand. I'm here to help with the interview question. Please go ahead with your question or concern.")
                .build());

        // Include last 10 messages for context (to manage token usage)
        int startIndex = Math.max(0, history.size() - 10);
        for (int i = startIndex; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            messages.add(ClaudeEvaluationRequest.ClaudeMessage.builder()
                    .role(msg.getRole().equals("ai") ? "assistant" : "user")
                    .content(msg.getContent())
                    .build());
        }

        // Add new question from candidate
        messages.add(ClaudeEvaluationRequest.ClaudeMessage.builder()
                .role("user")
                .content(newQuestion)
                .build());

        return messages;
    }

    /**
     * Call Claude API with custom request (for chat responses)
     */
    private ClaudeEvaluationResponse callClaudeAPIWithCustomRequest(ClaudeEvaluationRequest request) {
        try {
            ClaudeEvaluationResponse response = restTemplate.postForObject(
                    claudeProperties.getApiUrl() + "/messages",
                    createHttpEntity(request),
                    ClaudeEvaluationResponse.class
            );

            log.debug("Claude API call successful for chat response");
            return response;

        } catch (Exception e) {
            log.error("Error calling Claude API for chat: {}", e.getMessage(), e);
            return null;
        }
    }
}
