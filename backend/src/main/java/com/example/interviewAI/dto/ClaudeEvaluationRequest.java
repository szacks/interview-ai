package com.example.interviewAI.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClaudeEvaluationRequest {
    @JsonProperty("model")
    private String model;

    @JsonProperty("max_tokens")
    private Integer maxTokens;

    @JsonProperty("temperature")
    private Double temperature;

    @JsonProperty("messages")
    private List<ClaudeMessage> messages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClaudeMessage {
        @JsonProperty("role")
        private String role;

        @JsonProperty("content")
        private String content;
    }
}
