package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.Question;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.ChatMessageRepository;
import com.example.interviewAI.repository.CodeSubmissionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class QuestionSeeder implements CommandLineRunner {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private CodeSubmissionRepository codeSubmissionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Delete old questions and keep only Rate Limiter
        cleanupOldQuestions();

        // Check if Rate Limiter exists
        List<Question> existingRateLimiter = questionRepository.findByTitle("Rate Limiter");
        if (existingRateLimiter.isEmpty()) {
            log.info("Starting question database seeding...");
            seedQuestions();
            log.info("Question seeding completed successfully");
        } else {
            // Update all Rate Limiter questions to have the correct description
            // (handles duplicates gracefully by updating all)
            log.info("Updating Rate Limiter question(s) with new description");
            String newDescription = "Build a rate limiter that controls how many requests are allowed in a time window.\n\n" +
                    "EXAMPLE:\n" +
                    "const limiter = new RateLimiter(3, 1000); // 3 requests per second\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // false (limit reached)\n" +
                    "// After 1 second passes, requests are allowed again";
            int updateCount = 0;
            for (Question question : existingRateLimiter) {
                try {
                    log.info("Updating Rate Limiter question ID: {}", question.getId());
                    question.setDescription(newDescription);
                    Question saved = questionRepository.save(question);
                    log.info("Successfully saved Rate Limiter ID: {} with description length: {}", saved.getId(), saved.getDescription().length());
                    updateCount++;
                } catch (Exception e) {
                    log.error("Failed to update Rate Limiter ID: {}: {}", question.getId(), e.getMessage());
                }
            }
            log.info("Rate Limiter description updated successfully for {} question(s) out of {}", updateCount, existingRateLimiter.size());
        }
    }

    private void cleanupOldQuestions() {
        List<Question> allQuestions = questionRepository.findAll();
        List<Question> questionsToDelete = allQuestions.stream()
                .filter(q -> !q.getTitle().equals("Rate Limiter"))
                .toList();

        if (!questionsToDelete.isEmpty()) {
            log.info("Deleting {} old questions from database", questionsToDelete.size());

            // First, delete all interviews and their related data that reference these questions
            for (Question question : questionsToDelete) {
                var interviewsToDelete = interviewRepository.findAll().stream()
                        .filter(i -> i.getQuestion() != null && i.getQuestion().getId().equals(question.getId()))
                        .toList();

                if (!interviewsToDelete.isEmpty()) {
                    log.info("Deleting {} interviews for question: {}", interviewsToDelete.size(), question.getTitle());

                    // Delete all related data for each interview
                    for (var interview : interviewsToDelete) {
                        // Delete chat messages
                        var chatMessagesToDelete = chatMessageRepository.findAll().stream()
                                .filter(msg -> msg.getInterview() != null && msg.getInterview().getId().equals(interview.getId()))
                                .toList();
                        if (!chatMessagesToDelete.isEmpty()) {
                            log.info("Deleting {} chat messages for interview: {}", chatMessagesToDelete.size(), interview.getId());
                            chatMessageRepository.deleteAll(chatMessagesToDelete);
                        }

                        // Delete code submissions
                        var codeSubmissionsToDelete = codeSubmissionRepository.findAll().stream()
                                .filter(sub -> sub.getInterview() != null && sub.getInterview().getId().equals(interview.getId()))
                                .toList();
                        if (!codeSubmissionsToDelete.isEmpty()) {
                            log.info("Deleting {} code submissions for interview: {}", codeSubmissionsToDelete.size(), interview.getId());
                            codeSubmissionRepository.deleteAll(codeSubmissionsToDelete);
                        }
                    }

                    // Then delete interviews
                    interviewRepository.deleteAll(interviewsToDelete);
                }
            }

            // Finally delete the questions
            questionRepository.deleteAll(questionsToDelete);
            log.info("Successfully deleted old questions");
        }
    }

    private void seedQuestions() {
        // Question 5: Rate Limiter (Medium)
        Question rateLimiter = new Question();
        rateLimiter.setTitle("Rate Limiter");
        rateLimiter.setDescription("Build a rate limiter that controls how many requests are allowed in a time window.\n\n" +
                "EXAMPLE:\n" +
                "const limiter = new RateLimiter(3, 1000); // 3 requests per second\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // true\n" +
                "limiter.allowRequest(); // false (limit reached)\n" +
                "// After 1 second passes, requests are allowed again");
        rateLimiter.setDifficulty("medium");
        rateLimiter.setTimeLimitMinutes(30);
        rateLimiter.setSupportedLanguages("java,python,javascript");
        rateLimiter.setRequirementsJson("{\"requirements\":[" +
                "\"Create a rate limiter with max requests and time window\"," +
                "\"Implement allowRequest function\"," +
                "\"Track request timestamps efficiently\"," +
                "\"Handle time window expiration\"," +
                "\"Support multiple independent limiters\"]}");
        rateLimiter.setTestsJson("{\"tests\":[" +
                "{\"testCase\":\"TC1\",\"name\":\"allows requests under limit\",\"operations\":[],\"assertions\":[],\"description\":\"3 requests with limit 3 should all be true\"}," +
                "{\"testCase\":\"TC2\",\"name\":\"blocks request when limit reached\",\"operations\":[],\"assertions\":[],\"description\":\"3rd request with limit 2 should be false\"}," +
                "{\"testCase\":\"TC3\",\"name\":\"allows request after window expires\",\"operations\":[],\"assertions\":[],\"description\":\"After window expires, new requests should be allowed\"}," +
                "{\"testCase\":\"TC4\",\"name\":\"each limiter is independent\",\"operations\":[],\"assertions\":[],\"description\":\"Two limiters should track separately\"}," +
                "{\"testCase\":\"TC5\",\"name\":\"handles limit of 1\",\"operations\":[],\"assertions\":[],\"description\":\"Single request limit should work correctly\"}," +
                "{\"testCase\":\"TC6\",\"name\":\"sliding window - partial expiry\",\"operations\":[],\"assertions\":[],\"description\":\"Sliding window should handle partial expiry correctly\"}," +
                "{\"testCase\":\"TC7\",\"name\":\"high volume - 10 requests with limit 10\",\"operations\":[],\"assertions\":[],\"description\":\"Should handle high volume requests\"}" +
                "]}");
        rateLimiter.setRubricJson("{\"categories\":[" +
                "{\"category\":\"Correctness\",\"points\":25,\"description\":\"Basic solution passes tests\"}," +
                "{\"category\":\"Edge Cases\",\"points\":15,\"description\":\"Handles edge cases (limit=1, empty, boundary)\"}," +
                "{\"category\":\"Memory Efficiency\",\"points\":20,\"description\":\"Recognizes memory problem with high traffic\"}," +
                "{\"category\":\"Alternative Solutions\",\"points\":20,\"description\":\"Discusses or implements memory-efficient alternative\"}," +
                "{\"category\":\"AI Collaboration\",\"points\":20,\"description\":\"Uses AI effectively - asks good questions, reviews critically\"}" +
                "]}");
        rateLimiter.setIntentionalBugsJson("{\"bugs\":[" +
                "{\"name\":\"Memory grows unbounded\",\"description\":\"Stores all timestamps causing memory issues with high traffic\",\"difficulty\":\"common\"}," +
                "{\"name\":\"Doesn't filter expired requests\",\"description\":\"Counts expired requests towards the limit\",\"difficulty\":\"medium\"}," +
                "{\"name\":\"Off-by-one error\",\"description\":\"Allows one too many or too few requests\",\"difficulty\":\"common\"}," +
                "{\"name\":\"No window reset\",\"description\":\"Never allows new requests after window fills up\",\"difficulty\":\"hard\"}" +
                "]}");
        rateLimiter.setInitialCodeJava("// Rate Limiter\n" +
                "import java.util.*;\n\n" +
                "public class RateLimiter {\n" +
                "    \n" +
                "    public RateLimiter(int maxRequests, long windowMs) {\n" +
                "        // TODO: Initialize the rate limiter\n" +
                "    }\n" +
                "    \n" +
                "    public boolean allowRequest() {\n" +
                "        // TODO: Return true if request allowed, false if limit exceeded\n" +
                "        return false;\n" +
                "    }\n" +
                "}");
        rateLimiter.setInitialCodePython("# Rate Limiter\n" +
                "import time\n\n" +
                "class RateLimiter:\n" +
                "    def __init__(self, max_requests, window_ms):\n" +
                "        # TODO: Initialize the rate limiter\n" +
                "        pass\n\n" +
                "    def allow_request(self):\n" +
                "        # TODO: Return True if request allowed, False if limit exceeded\n" +
                "        return False");
        rateLimiter.setInitialCodeJavascript("// Rate Limiter\n\n" +
                "class RateLimiter {\n" +
                "  constructor(maxRequests, windowMs) {\n" +
                "    // TODO: Initialize the rate limiter\n" +
                "  }\n\n" +
                "  allowRequest() {\n" +
                "    // TODO: Return true if request allowed, false if limit exceeded\n" +
                "    return false;\n" +
                "  }\n" +
                "}");
        rateLimiter.setCreatedAt(LocalDateTime.now());

        // Save all questions to database
        questionRepository.saveAll(Arrays.asList(rateLimiter));
        log.info("Successfully seeded 1 question to database: Rate Limiter");
    }
}
