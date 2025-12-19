package com.example.interviewAI.repository;

import com.example.interviewAI.entity.FollowUpQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpQuestionRepository extends JpaRepository<FollowUpQuestion, Long> {
    List<FollowUpQuestion> findByQuestionId(Long questionId);
    List<FollowUpQuestion> findByQuestionIdOrderByOrderIndex(Long questionId);
}
