package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // Dynamic assessment parameters
    @OneToMany(mappedBy = "scoringSettings", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("orderIndex ASC")
    private List<ScoringParameter> parameters = new ArrayList<>();

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
