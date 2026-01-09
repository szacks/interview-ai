package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_settings", uniqueConstraints = @UniqueConstraint(columnNames = "company_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.DynamicUpdate
public class CompanySettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    // Score Distribution (company level)
    @Column(name = "auto_score_weight", nullable = false)
    @Builder.Default
    private Integer autoScoreWeight = 40;

    @Column(name = "manual_score_weight", nullable = false)
    @Builder.Default
    private Integer manualScoreWeight = 60;

    // Data Retention (admin level)
    @Column(name = "data_retention_days", nullable = false)
    @Builder.Default
    private Integer dataRetentionDays = 90; // -1 means forever

    // Session Settings (admin level)
    @Column(name = "default_session_timeout_minutes", nullable = false)
    @Builder.Default
    private Integer defaultSessionTimeoutMinutes = 120; // -1 means never

    // Scoring Thresholds (company level)
    @Column(name = "score_exceptional_threshold", nullable = false)
    @Builder.Default
    private Integer scoreExceptionalThreshold = 91;

    @Column(name = "score_strong_threshold", nullable = false)
    @Builder.Default
    private Integer scoreStrongThreshold = 81;

    @Column(name = "score_good_threshold", nullable = false)
    @Builder.Default
    private Integer scoreGoodThreshold = 71;

    @Column(name = "score_concerning_threshold", nullable = false)
    @Builder.Default
    private Integer scoreConcerningThreshold = 51;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
