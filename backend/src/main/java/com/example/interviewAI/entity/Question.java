package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String difficulty; // 'easy', 'medium', 'hard'

    @Column
    private Integer timeLimitMinutes;

    @Column
    private String supportedLanguages; // e.g., 'java,python,javascript'

    @Column(columnDefinition = "TEXT", nullable = false)
    private String requirementsJson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String testsJson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String rubricJson;

    @Column(columnDefinition = "TEXT")
    private String intentionalBugsJson;

    @Column(columnDefinition = "TEXT")
    private String initialCodeJava;

    @Column(columnDefinition = "TEXT")
    private String initialCodePython;

    @Column(columnDefinition = "TEXT")
    private String initialCodeJavascript;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private List<FollowUpQuestion> followUpQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private List<TestCase> testCases = new ArrayList<>();
}
