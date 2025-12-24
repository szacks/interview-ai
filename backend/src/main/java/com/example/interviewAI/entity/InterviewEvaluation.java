package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewEvaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false, unique = true)
    private Interview interview;

    // Auto Score
    @Column(name = "tests_passed")
    private Integer testsPassed;

    @Column(name = "tests_total")
    private Integer testsTotal;

    @Column(name = "auto_score_original")
    private Integer autoScoreOriginal;

    @Column(name = "auto_score_adjusted")
    private Integer autoScoreAdjusted;

    @Column(name = "auto_score_adjusted_reason", columnDefinition = "TEXT")
    private String autoScoreAdjustedReason;

    // Manual Scores (4 parameters)
    @Column(name = "manual_score_communication")
    private Integer manualScoreCommunication;

    @Column(name = "manual_score_algorithmic")
    private Integer manualScoreAlgorithmic;

    @Column(name = "manual_score_problem_solving")
    private Integer manualScoreProblemSolving;

    @Column(name = "manual_score_ai_collaboration")
    private Integer manualScoreAiCollaboration;

    // Notes for each parameter
    @Column(name = "notes_communication", columnDefinition = "TEXT")
    private String notesCommunication;

    @Column(name = "notes_algorithmic", columnDefinition = "TEXT")
    private String notesAlgorithmic;

    @Column(name = "notes_problem_solving", columnDefinition = "TEXT")
    private String notesProblemSolving;

    @Column(name = "notes_ai_collaboration", columnDefinition = "TEXT")
    private String notesAiCollaboration;

    // Custom observations
    @Column(name = "custom_observations", columnDefinition = "TEXT")
    private String customObservations;

    // Final score (calculated, stored for reference)
    @Column(name = "final_score")
    private Integer finalScore;

    // Draft status
    @Column(name = "is_draft")
    private Boolean isDraft = true;

    // Timestamps
    @Column(name = "evaluation_submitted_at")
    private LocalDateTime evaluationSubmittedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
