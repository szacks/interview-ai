package com.example.interviewAI.repository;

import com.example.interviewAI.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDifficulty(String difficulty);

    List<Question> findBySupportedLanguagesContaining(String language);

    List<Question> findByTitle(String title);

    @Query("SELECT q FROM Question q WHERE q.difficulty = ?1 AND q.supportedLanguages LIKE %?2%")
    List<Question> findByDifficultyAndLanguage(String difficulty, String language);

    @Query("SELECT q FROM Question q WHERE q.supportedLanguages LIKE %?1%")
    List<Question> findByLanguage(String language);
}
