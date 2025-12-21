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
        List<Question> allQuestions = questionRepository.findAll();

        for (Question question : allQuestions) {
            List<FollowUpQuestion> followUps = new ArrayList<>();

            if (question.getTitle().equals("Two Sum")) {
                followUps.add(createFollowUpQuestion(question,
                    "What's the time complexity of your solution?",
                    "O(n) time complexity with a hash map to store visited numbers. O(n) space complexity, and handles edge cases like duplicates or negative numbers.",
                    0));
                followUps.add(createFollowUpQuestion(question,
                    "How would you handle duplicates in the array?",
                    "Check if the current number has already been seen before processing it. You can use a hash map to track indices and ensure you don't use the same element twice. Also handle the case where the same value appears multiple times.",
                    1));
                followUps.add(createFollowUpQuestion(question,
                    "What if the array is sorted?",
                    "You could use two pointers from both ends of the array. With a sorted array, use two pointers (one at start, one at end). Move them inward based on whether the sum is too small or too large.",
                    2));
            } else if (question.getTitle().equals("Valid Parentheses")) {
                followUps.add(createFollowUpQuestion(question,
                    "How would you modify this to support XML tags?",
                    "You would need to store the tag name on the stack and match closing tags. Parse opening tags (e.g., <div>) and closing tags (e.g., </div>), then match tag names. The stack would store the tag name, not just the bracket character.",
                    0));
                followUps.add(createFollowUpQuestion(question,
                    "What's the space complexity of your solution?",
                    "O(n) space in worst case when all characters are opening brackets. O(n) space complexity in the worst case, but typically O(n/2) due to balanced bracket nature. Time complexity is O(n).",
                    1));
                followUps.add(createFollowUpQuestion(question,
                    "Can you solve this without using a stack?",
                    "It's difficult because you need to track matching pairs. Very challenging without a stack. You could use recursion, but the stack-based approach is most efficient and clearest.",
                    2));
            } else if (question.getTitle().equals("Longest Substring Without Repeating Characters")) {
                followUps.add(createFollowUpQuestion(question,
                    "Can you optimize this further?",
                    "The sliding window approach with a hash map is already optimal at O(n). You could potentially use a fixed-size array instead of a hash map for ASCII characters for better cache locality.",
                    0));
                followUps.add(createFollowUpQuestion(question,
                    "How would you handle Unicode characters?",
                    "Use a hash map instead of an array to support any character. A hash map naturally handles Unicode characters. If you use an array for ASCII only (size 128 or 256), you'd need to switch to a map for Unicode support.",
                    1));
                followUps.add(createFollowUpQuestion(question,
                    "What's the space complexity?",
                    "Space complexity is O(min(m, n)) where m is the charset size and n is the string length. For Unicode, it depends on distinct characters in the string. O(min(m, n)) where m is the character set size (e.g., 26 for lowercase, 128 for ASCII) and n is string length.",
                    2));
            } else if (question.getTitle().equals("Rate Limiter")) {
                followUps.add(createFollowUpQuestion(question,
                    "What happens if this API gets 10,000 requests per second?",
                    "The timestamps array would grow to 10,000 entries, using a lot of memory. We could use a sliding window counter with fixed buckets, or a token bucket algorithm. These use O(1) memory regardless of traffic.",
                    0));
                followUps.add(createFollowUpQuestion(question,
                    "What's the tradeoff between your current solution and a fixed-memory solution?",
                    "Current solution is precise but uses O(n) memory. Fixed-memory solutions are approximate but use O(1) memory. Current solution trades precision and simplicity for memory usage. Fixed-memory solutions like sliding window counter offer better scalability but sacrifice precision at bucket boundaries.",
                    1));
                followUps.add(createFollowUpQuestion(question,
                    "What if this needs to work across multiple servers?",
                    "You would need to store the rate limiter state in a shared location like Redis. Use Redis or a distributed cache to store the rate limiter state. Handle race conditions with atomic operations or Lua scripts. Consider eventual consistency trade-offs.",
                    2));
                followUps.add(createFollowUpQuestion(question,
                    "How would you properly test a time-based function like this?",
                    "Inject the time function so tests don't depend on real time. Mock Date.now() to control the clock. Dependency injection for the time source enables deterministic testing. Mock Date.now() to test boundary conditions and edge cases without waiting for real time to pass.",
                    3));
            } else if (question.getTitle().equals("Shopping Cart with Discount Rules")) {
                followUps.add(createFollowUpQuestion(question,
                    "How would you handle dynamic discount rules?",
                    "Load discount rules from a configuration service or database. Create a discount engine that loads rules from a configurable source, allowing rules to be updated without code changes. Use a strategy pattern for different rule types.",
                    0));
                followUps.add(createFollowUpQuestion(question,
                    "What if discounts need to be applied in a specific order?",
                    "Specify priority or order in the discount rule configuration. Implement an ordered list of discount rules with priority levels. Apply higher-priority discounts first, then lower ones, respecting the maximum cap.",
                    1));
                followUps.add(createFollowUpQuestion(question,
                    "How would you test all possible discount combinations?",
                    "Create comprehensive unit tests covering all rule combinations. Use parameterized tests with various input combinations, edge cases, and verify the discount cap is never exceeded. Test empty carts, single items, and all discount rule interactions.",
                    2));
            }

            if (!followUps.isEmpty()) {
                followUpQuestionRepository.saveAll(followUps);
                log.info("Added {} follow-up questions for: {}", followUps.size(), question.getTitle());
            }
        }
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
