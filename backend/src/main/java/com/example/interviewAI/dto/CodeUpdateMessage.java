package com.example.interviewAI.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Message payload for code update events during interview.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeUpdateMessage {

    /**
     * Updated code content
     */
    private String code;

    /**
     * Programming language (javascript, python, java, typescript)
     */
    private String language;

    /**
     * Line number where change started (for optimization)
     */
    private Integer startLine;

    /**
     * Line number where change ended (for optimization)
     */
    private Integer endLine;
}
