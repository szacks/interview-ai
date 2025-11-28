package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String codeSnapshot;

    @Column
    private String language;

    @Column(columnDefinition = "JSONB")
    private String conversationLog;

    @Column(columnDefinition = "JSONB")
    private String testResults;

    @Column
    private Integer automatedScore;

    @Column
    private Integer manualScore;

    @Column
    private Integer finalScore;

    @Column(columnDefinition = "TEXT")
    private String interviewerNotes;

    @Column
    private String recommendation; // 'hire', 'no_hire', 'maybe'

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToOne
    @JoinColumn(name = "interview_id", unique = true)
    private Interview interview;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
