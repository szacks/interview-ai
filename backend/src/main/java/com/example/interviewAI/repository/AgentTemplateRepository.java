package com.example.interviewAI.repository;

import com.example.interviewAI.entity.AgentTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgentTemplateRepository extends JpaRepository<AgentTemplate, Long> {
    List<AgentTemplate> findByIsSystemTrue();

    List<AgentTemplate> findByCompanyIdOrCompanyIdIsNull(Long companyId);

    Optional<AgentTemplate> findByNameAndIsSystemTrue(String name);
}
