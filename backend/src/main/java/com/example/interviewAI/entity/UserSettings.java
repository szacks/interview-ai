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

    /**
     * @deprecated Use CompanySettings.autoScoreWeight instead (company-level setting)
     * Kept for backward compatibility - new code should use company settings
     */
    @Deprecated
    @Column(nullable = false)
    @Builder.Default
    private Integer autoScoreWeight = 50; // 0-100, percentage - DEPRECATED: use company settings

    @Column(nullable = false)
    @Builder.Default
    private Integer sessionTimeoutMinutes = 120; // default 2 hours, -1 means never

    /**
     * @deprecated Use CompanySettings.dataRetentionDays instead (admin-level setting)
     * Kept for backward compatibility - new code should use company settings
     */
    @Deprecated
    @Column(nullable = false)
    @Builder.Default
    private Integer dataRetentionDays = 90; // default 90 days - DEPRECATED: use company settings

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
