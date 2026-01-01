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

    // ========== Ownership & Company Isolation ==========
    @Column
    private Long companyId; // NULL = platform question, set = company-specific

    @Column
    private Long createdBy; // User who created this question

    // ========== Basic Information ==========
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description; // Full markdown with examples and constraints

    @Column
    private String category; // 'algorithm', 'data_structures', 'backend', 'frontend', etc.

    @Column(columnDefinition = "TEXT")
    private String shortDescription; // Elevator pitch for the question

    @Column(nullable = false)
    private String difficulty; // 'easy', 'medium', 'hard'

    // ========== Metadata Fields (from original schema) ==========
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

    // ========== Code Templates ==========
    @Column(columnDefinition = "TEXT")
    private String initialCodeJava;

    @Column(columnDefinition = "TEXT")
    private String initialCodePython;

    @Column(columnDefinition = "TEXT")
    private String initialCodeJavascript;

    // ========== AI Configuration ==========
    @Column
    private String aiPromptTemplate; // 'helpful', 'minimal', 'socratic', 'strict'

    @Column(columnDefinition = "TEXT")
    private String aiCustomPrompt; // Custom prompt that overrides template

    // ========== Follow-up Questions (JSONB) ==========
    // Format: [{"id": "fq_1", "question": "...", "expectedAnswer": "..."}]
    @Column(columnDefinition = "TEXT")
    private String followupQuestionsJson;

    // ========== Code Generation Tracking ==========
    @Column
    private String primaryLanguage; // 'java', 'python', 'javascript'

    // Format: {"java": {"generated": false, "reviewed": true}, "python": {"generated": true, "reviewed": true}}
    @Column(columnDefinition = "TEXT")
    private String generatedLanguagesJson;

    // ========== Versioning & Status ==========
    @Column
    private String status = "DRAFT"; // 'DRAFT', 'PUBLISHED', 'ARCHIVED'

    @Column
    private Integer version = 1; // Version number for tracking changes

    @Column
    private Long parentQuestionId; // ID of parent question if this is a version/fork

    // ========== Analytics & Metadata ==========
    @Column
    private Integer usageCount = 0; // How many times used in interviews

    @Column
    private java.math.BigDecimal averageScore; // Average candidate score (0-100)

    // ========== Timestamps ==========
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime publishedAt; // When question was published

    @Column
    private LocalDateTime archivedAt; // When question was archived

    @Column
    private LocalDateTime updatedAt; // Last updated time

    // ========== Relationships ==========
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private List<FollowUpQuestion> followUpQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private List<TestCase> testCases = new ArrayList<>();
}
