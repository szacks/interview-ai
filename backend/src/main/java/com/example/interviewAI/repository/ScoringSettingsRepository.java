package com.example.interviewAI.repository;

import com.example.interviewAI.entity.ScoringSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoringSettingsRepository extends JpaRepository<ScoringSettings, Long> {
    Optional<ScoringSettings> findByCompanyId(Long companyId);
    boolean existsByCompanyId(Long companyId);
}
