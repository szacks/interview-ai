package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings", uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.DynamicUpdate
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column
    private Long defaultAgentId; // FK to agents table, nullable

    @Column(nullable = false)
    @Builder.Default
    private Boolean showRunTests = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer autoScoreWeight = 50; // 0-100, percentage

    @Column(nullable = false)
    @Builder.Default
    private Integer sessionTimeoutMinutes = 120; // default 2 hours, -1 means never

    @Column(nullable = false)
    @Builder.Default
    private Integer dataRetentionDays = 90; // default 90 days, -1 means forever

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
