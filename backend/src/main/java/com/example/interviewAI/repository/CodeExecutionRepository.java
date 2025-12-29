package com.example.interviewAI.repository;

import com.example.interviewAI.entity.CodeExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeExecutionRepository extends JpaRepository<CodeExecution, Long> {

    /**
     * Find all code executions for an interview, ordered by most recent first
     */
    List<CodeExecution> findByInterviewIdOrderByExecutedAtDesc(Long interviewId);

    /**
     * Find the latest code execution for an interview
     */
    @Query("SELECT ce FROM CodeExecution ce WHERE ce.interview.id = :interviewId ORDER BY ce.executedAt DESC LIMIT 1")
    Optional<CodeExecution> findLatestByInterviewId(@Param("interviewId") Long interviewId);
}
