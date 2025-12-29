package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "code_executions", indexes = {
    @Index(name = "idx_execution_interview", columnList = "interview_id"),
    @Index(name = "idx_execution_timestamp", columnList = "executed_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    // Status: "success", "error", "timeout", "compilation_error"
    @Column(nullable = false)
    private String status;

    @Column
    private Integer testsPassed;

    @Column
    private Integer testsTotal;

    @Column
    private Integer autoScore;

    @Column
    private Long executionTimeMs;

    @Column(columnDefinition = "TEXT")
    private String testDetails; // JSON array of test case results

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String stdout;

    @Column(columnDefinition = "TEXT")
    private String stderr;

    @Column(nullable = false)
    private LocalDateTime executedAt;

    @PrePersist
    protected void onCreate() {
        if (executedAt == null) {
            executedAt = LocalDateTime.now();
        }
    }
}
