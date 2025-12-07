package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeSubmissionResponse {
    private Long id;
    private String language;
    private String code;
    private LocalDateTime timestamp;
}
