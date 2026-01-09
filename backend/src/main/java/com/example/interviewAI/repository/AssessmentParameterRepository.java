package com.example.interviewAI.repository;

import com.example.interviewAI.entity.AssessmentParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentParameterRepository extends JpaRepository<AssessmentParameter, Long> {
    List<AssessmentParameter> findByCompanyIdAndIsActiveOrderByDisplayOrderAsc(Long companyId, Boolean isActive);

    List<AssessmentParameter> findByCompanyIdOrderByDisplayOrderAsc(Long companyId);

    boolean existsByCompanyIdAndNameAndIdNot(Long companyId, String name, Long id);

    boolean existsByCompanyIdAndName(Long companyId, String name);
}
