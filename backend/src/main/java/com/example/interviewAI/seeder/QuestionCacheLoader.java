package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.service.QuestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Cache loader that warms up the Spring Cache with all questions on application startup.
 * This ensures that the first request for questions is fast and doesn't require database queries.
 *
 * Questions are pre-loaded for each company and for the platform (no companyId).
 * This eliminates cold-start performance issues and ensures consistent response times.
 *
 * Runs after other seeders (Order 100) to ensure questions are already seeded into the database.
 */
@Slf4j
@Component
@Order(100) // Run after other seeders
public class QuestionCacheLoader implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuestionService questionService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            log.info("Starting question cache warm-up...");

            // Get all distinct company IDs from questions
            List<Question> allQuestions = questionRepository.findAll();

            Set<Long> companyIds = allQuestions.stream()
                    .map(Question::getCompanyId)
                    .collect(Collectors.toSet());

            // Load platform questions (companyId = NULL)
            log.info("Pre-loading platform questions into cache...");
            questionService.getAllQuestions(null);
            log.info("Platform questions loaded into cache");

            // Load questions for each company
            for (Long companyId : companyIds) {
                if (companyId != null) {
                    log.debug("Pre-loading questions for companyId: {} into cache", companyId);
                    questionService.getAllQuestions(companyId);
                    log.debug("Questions for companyId: {} loaded into cache", companyId);
                }
            }

            log.info("Question cache warm-up completed successfully. {} unique companies/platforms cached", companyIds.size());

        } catch (Exception e) {
            log.error("Error during question cache warm-up", e);
            // Don't rethrow - allow application to continue if caching fails
            // The cache will be populated on first access
        }
    }
}
