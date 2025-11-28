package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String difficulty; // 'easy', 'medium', 'hard'

    @Column
    private Integer timeLimitMinutes;

    @Column
    private String supportedLanguages; // e.g., 'java,python,javascript'

    @Column(columnDefinition = "JSONB", nullable = false)
    private String requirementsJson;

    @Column(columnDefinition = "JSONB", nullable = false)
    private String testsJson;

    @Column(columnDefinition = "JSONB", nullable = false)
    private String rubricJson;

    @Column(columnDefinition = "JSONB")
    private String intentionalBugsJson;

    @Column(columnDefinition = "TEXT")
    private String initialCodeJava;

    @Column(columnDefinition = "TEXT")
    private String initialCodePython;

    @Column(columnDefinition = "TEXT")
    private String initialCodeJavascript;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
