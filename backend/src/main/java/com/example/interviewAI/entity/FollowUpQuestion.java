package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "follow_up_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowUpQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    private Integer orderIndex = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
