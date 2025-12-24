package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.FollowUpQuestion;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.FollowUpQuestionRepository;
import com.example.interviewAI.repository.QuestionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class FollowUpQuestionSeeder implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private FollowUpQuestionRepository followUpQuestionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if follow-up questions already exist
        long existingCount = followUpQuestionRepository.count();

        if (existingCount == 0) {
            log.info("Starting follow-up questions seeding...");
            seedFollowUpQuestions();
            log.info("Follow-up questions seeding completed successfully");
        } else {
            log.info("Follow-up questions already exist in database, ensuring Rate Limiter questions are up to date");
            ensureRateLimiterFollowUpQuestions();
        }
    }

    private void ensureRateLimiterFollowUpQuestions() {
        try {
            List<Question> rateLimiterQuestions = questionRepository.findByTitle("Rate Limiter");
            if (rateLimiterQuestions.isEmpty()) {
                log.warn("Rate Limiter question not found");
                return;
            }

            Question rateLimiter = rateLimiterQuestions.get(0);

            // Delete existing Rate Limiter follow-up questions by clearing the list
            // This triggers cascade delete via the orphanRemoval = true in the relationship
            int existingCount = rateLimiter.getFollowUpQuestions().size();
            if (existingCount > 0) {
                rateLimiter.getFollowUpQuestions().clear();
                log.info("Cleared {} existing Rate Limiter follow-up questions", existingCount);
            }

            // Create new follow-up questions with updated content
            List<FollowUpQuestion> followUps = new ArrayList<>();

            followUps.add(createFollowUpQuestion(rateLimiter,
                    "What happens if this API gets 10,000 requests per second?",
                    "The timestamps array would grow to 10,000 entries, using a lot of memory. We could use a sliding window counter with fixed buckets, or a token bucket algorithm. These use O(1) memory regardless of traffic.",
                    0));

            followUps.add(createFollowUpQuestion(rateLimiter,
                    "What's the tradeoff between your current solution and a fixed-memory solution?",
                    "Current solution is precise but uses O(n) memory. Fixed-memory solutions are approximate but use O(1) memory. Current solution trades precision and simplicity for memory usage. Fixed-memory solutions like sliding window counter offer better scalability but sacrifice precision at bucket boundaries.",
                    1));

            followUps.add(createFollowUpQuestion(rateLimiter,
                    "What if this needs to work across multiple servers?",
                    "You would need to store the rate limiter state in a shared location like Redis. Use Redis or a distributed cache to store the rate limiter state. Handle race conditions with atomic operations or Lua scripts. Consider eventual consistency trade-offs.",
                    2));

            followUps.add(createFollowUpQuestion(rateLimiter,
                    "How would you properly test a time-based function like this?",
                    "Inject the time function so tests don't depend on real time. Mock Date.now() to control the clock. Dependency injection for the time source enables deterministic testing. Mock Date.now() to test boundary conditions and edge cases without waiting for real time to pass.",
                    3));

            // Add new follow-up questions to the Question
            // This will be saved when we save the Question due to cascade
            for (FollowUpQuestion followUp : followUps) {
                rateLimiter.getFollowUpQuestions().add(followUp);
            }

            // Save the Question with its updated follow-up questions
            questionRepository.save(rateLimiter);
            log.info("Updated Rate Limiter follow-up questions with {} questions", followUps.size());
        } catch (Exception e) {
            log.error("Error ensuring Rate Limiter follow-up questions", e);
        }
    }

    private void seedFollowUpQuestions() {
        // Follow-up questions are now handled by ensureRateLimiterFollowUpQuestions()
        // which runs on every startup. This method is a no-op to maintain compatibility.
    }

    private FollowUpQuestion createFollowUpQuestion(Question question, String questionText,
                                                     String answer, Integer orderIndex) {
        FollowUpQuestion followUp = new FollowUpQuestion();
        followUp.setQuestion(question);
        followUp.setQuestionText(questionText);
        followUp.setAnswer(answer);
        followUp.setOrderIndex(orderIndex);
        return followUp;
    }
}
