package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "scoring_settings", uniqueConstraints = @UniqueConstraint(columnNames = "company_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoringSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // Overall score weights
    @Column(name = "auto_score_weight", nullable = false)
    private Double autoScoreWeight = 0.4; // Default 40%

    @Column(name = "manual_score_weight", nullable = false)
    private Double manualScoreWeight = 0.6; // Default 60%

    // Individual manual score parameter weights
    @Column(name = "communication_weight", nullable = false)
    private Double communicationWeight = 0.25;

    @Column(name = "algorithmic_weight", nullable = false)
    private Double algorithmicWeight = 0.25;

    @Column(name = "problem_solving_weight", nullable = false)
    private Double problemSolvingWeight = 0.25;

    @Column(name = "ai_collaboration_weight", nullable = false)
    private Double aiCollaborationWeight = 0.25;

    // Additional configurable parameters (stored as JSON for flexibility)
    @Column(name = "additional_parameters", columnDefinition = "TEXT")
    private String additionalParameters; // JSON array of additional parameters

    // Timestamps
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
