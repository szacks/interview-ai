package com.example.interviewAI.repository;

import com.example.interviewAI.entity.ScoringParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoringParameterRepository extends JpaRepository<ScoringParameter, Long> {
    List<ScoringParameter> findByScoringSettingsIdOrderByOrderIndexAsc(Long scoringSettingsId);

    void deleteByScoringSettingsId(Long scoringSettingsId);
}
