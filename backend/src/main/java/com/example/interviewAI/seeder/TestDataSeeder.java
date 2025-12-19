package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.Candidate;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.repository.CandidateRepository;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component  // Test data seeding enabled - creates fresh test data if not exists
public class TestDataSeeder implements CommandLineRunner {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        logExistingTestData();

        // Check if we need to create test interviews
        if (interviewRepository.count() == 0) {
            log.info("No interviews found. Creating test interviews...");
            seedTestInterviews();
            log.info("Test interviews created successfully");
        } else {
            // Check if Rate Limiter interview exists
            ensureRateLimiterInterview();
        }
    }

    private void logExistingTestData() {
        try {
            java.util.List<com.example.interviewAI.entity.Company> companies = (java.util.List<com.example.interviewAI.entity.Company>) companyRepository.findAll();
            java.util.List<com.example.interviewAI.entity.Interview> interviews = (java.util.List<com.example.interviewAI.entity.Interview>) interviewRepository.findAll();
            java.util.List<com.example.interviewAI.entity.Candidate> candidates = (java.util.List<com.example.interviewAI.entity.Candidate>) candidateRepository.findAll();
            java.util.List<com.example.interviewAI.entity.User> users = (java.util.List<com.example.interviewAI.entity.User>) userRepository.findAll();

            log.info("================== TEST DATA ALREADY EXISTS ==================");
            log.info("Companies: {}", companies.size());
            for (com.example.interviewAI.entity.Company company : companies) {
                log.info("  - {} (ID: {}, Email: {})", company.getName(), company.getId(), company.getEmail());
            }

            log.info("Users/Interviewers: {}", users.size());
            for (com.example.interviewAI.entity.User user : users) {
                log.info("  - {} (ID: {}, Email: {}, Role: {})", user.getName(), user.getId(), user.getEmail(), user.getRole());
            }

            log.info("Candidates: {}", candidates.size());
            for (com.example.interviewAI.entity.Candidate candidate : candidates) {
                log.info("  - {} (ID: {}, Email: {})", candidate.getName(), candidate.getId(), candidate.getEmail());
            }

            log.info("Interviews: {}", interviews.size());
            for (com.example.interviewAI.entity.Interview interview : interviews) {
                log.info("  - Interview ID: {} | Candidate: {} | Question: {} | Status: {} | Token: {}",
                        interview.getId(),
                        interview.getCandidate() != null ? interview.getCandidate().getName() : "N/A",
                        interview.getQuestion() != null ? interview.getQuestion().getTitle() : "N/A",
                        interview.getStatus(),
                        interview.getInterviewLinkToken());

                // Log the candidate page URL for in_progress interviews
                if ("in_progress".equals(interview.getStatus())) {
                    log.info("    ✓ Test Candidate Page: http://localhost:3000/i/{}", interview.getInterviewLinkToken());
                    log.info("    ✓ Interviewer Page: http://localhost:3000/interview/{}", interview.getId());
                }
            }
            log.info("===========================================================");
        } catch (Exception e) {
            log.warn("Error logging existing test data", e);
        }
    }

    private void ensureRateLimiterInterview() {
        try {
            // Check if Rate Limiter interview already exists
            java.util.List<Interview> rateLimiterInterviews = interviewRepository.findAll().stream()
                    .filter(i -> i.getQuestion() != null && "Rate Limiter".equals(i.getQuestion().getTitle()))
                    .collect(java.util.stream.Collectors.toList());

            if (!rateLimiterInterviews.isEmpty()) {
                log.info("Rate Limiter interview already exists, updating question code templates");
                // Update the Rate Limiter question with new code templates
                updateRateLimiterQuestion();
                return;
            }

            // Get first company
            java.util.List<Company> companies = (java.util.List<Company>) companyRepository.findAll();
            if (companies.isEmpty()) {
                log.warn("No companies found, cannot create Rate Limiter interview");
                return;
            }
            Company company = companies.get(0);

            // Get first interviewer
            java.util.List<User> interviewers = (java.util.List<User>) userRepository.findAll();
            User interviewer = null;
            for (User user : interviewers) {
                if (user.getRole() == RoleEnum.INTERVIEWER) {
                    interviewer = user;
                    break;
                }
            }
            if (interviewer == null && !interviewers.isEmpty()) {
                interviewer = interviewers.get(0);
            }
            if (interviewer == null) {
                log.warn("No interviewers found, cannot create Rate Limiter interview");
                return;
            }

            // Get first candidate
            java.util.List<Candidate> candidates = (java.util.List<Candidate>) candidateRepository.findAll();
            if (candidates.isEmpty()) {
                log.warn("No candidates found, cannot create Rate Limiter interview");
                return;
            }
            Candidate candidate = candidates.get(0);

            // Get Rate Limiter question
            java.util.List<Question> rateLimiterQuestions = questionRepository.findByTitle("Rate Limiter");
            if (rateLimiterQuestions.isEmpty()) {
                log.warn("Rate Limiter question not found in database");
                return;
            }
            Question rateLimiterQuestion = rateLimiterQuestions.get(0);

            // Create Rate Limiter interview
            Interview rateLimiterInterview = new Interview();
            rateLimiterInterview.setCompany(company);
            rateLimiterInterview.setCandidate(candidate);
            rateLimiterInterview.setQuestion(rateLimiterQuestion);
            rateLimiterInterview.setInterviewer(interviewer);
            rateLimiterInterview.setLanguage("javascript");
            rateLimiterInterview.setStatus("in_progress");
            rateLimiterInterview.setInterviewLinkToken(UUID.randomUUID().toString());
            rateLimiterInterview.setScheduledAt(LocalDateTime.now());
            rateLimiterInterview.setStartedAt(LocalDateTime.now());
            rateLimiterInterview = interviewRepository.save(rateLimiterInterview);
            log.info("Created Rate Limiter in_progress interview: {} (Token: {})", rateLimiterInterview.getId(), rateLimiterInterview.getInterviewLinkToken());
            log.info("Rate Limiter Test Page: http://localhost:3000/i/{}", rateLimiterInterview.getInterviewLinkToken());
            log.info("Rate Limiter Interviewer Page: http://localhost:3000/interview/{}", rateLimiterInterview.getId());
        } catch (Exception e) {
            log.error("Error ensuring Rate Limiter interview", e);
        }
    }

    private void updateRateLimiterQuestion() {
        try {
            java.util.List<Question> rateLimiterQuestions = questionRepository.findByTitle("Rate Limiter");
            if (rateLimiterQuestions.isEmpty()) {
                return;
            }

            Question rateLimiter = rateLimiterQuestions.get(0);

            // Update description with new function signatures
            rateLimiter.setDescription("Build a rate limiter that controls how many requests are allowed in a time window.\n\n" +
                    "FUNCTIONS TO IMPLEMENT:\n\n" +
                    "1. RateLimiter(maxRequests, windowMs)\n" +
                    "   - Constructor that creates a rate limiter\n" +
                    "   - maxRequests: maximum allowed requests in the window\n" +
                    "   - windowMs: time window in milliseconds\n\n" +
                    "2. allowRequest()\n" +
                    "   - Instance method: call this for each incoming request\n" +
                    "   - Returns true if request is allowed\n" +
                    "   - Returns false if limit exceeded\n\n" +
                    "EXAMPLE:\n" +
                    "  const limiter = new RateLimiter(5, 1000);  // 5 requests per second\n" +
                    "  limiter.allowRequest();  // true\n" +
                    "  limiter.allowRequest();  // true\n" +
                    "  limiter.allowRequest();  // true\n" +
                    "  limiter.allowRequest();  // true\n" +
                    "  limiter.allowRequest();  // true\n" +
                    "  limiter.allowRequest();  // false (limit reached)\n" +
                    "  // After 1 second passes, requests are allowed again\n\n" +
                    "USE CASE:\n" +
                    "Imagine this protects an API endpoint. You want to allow each user maximum 100 requests per minute to prevent abuse.\n\n" +
                    "HINT: Use Date.now() to get the current timestamp in milliseconds.");

            // Update with new code templates
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

            questionRepository.save(rateLimiter);
            log.info("Updated Rate Limiter question with new code templates");
        } catch (Exception e) {
            log.error("Error updating Rate Limiter question", e);
        }
    }

    private void seedTestInterviews() {
        try {
            // Get first company (or create one if none exists)
            java.util.List<Company> companies = (java.util.List<Company>) companyRepository.findAll();
            Company company = companies.isEmpty() ? createTestCompany() : companies.get(0);

            // Get first interviewer user with INTERVIEWER role
            java.util.List<User> interviewers = (java.util.List<User>) userRepository.findAll();
            User interviewer = null;
            for (User user : interviewers) {
                if (user.getRole() == RoleEnum.INTERVIEWER) {
                    interviewer = user;
                    break;
                }
            }
            if (interviewer == null && !interviewers.isEmpty()) {
                interviewer = interviewers.get(0);
            }

            // Get first two candidates (or create them if not enough)
            java.util.List<Candidate> candidates = (java.util.List<Candidate>) candidateRepository.findAll();
            Candidate candidate1 = null;
            Candidate candidate2 = null;
            if (candidates.size() >= 2) {
                candidate1 = candidates.get(0);
                candidate2 = candidates.get(1);
            } else if (candidates.size() == 1) {
                candidate1 = candidates.get(0);
                candidate2 = createCandidate("John Smith", "john@candidate.com");
            } else {
                candidate1 = createCandidate("Jane Doe", "jane@candidate.com");
                candidate2 = createCandidate("John Smith", "john@candidate.com");
            }

            // Get seeded questions
            java.util.List<Question> easyQuestions = questionRepository.findByDifficulty("easy");
            java.util.List<Question> mediumQuestions = questionRepository.findByDifficulty("medium");
            java.util.List<Question> rateLimiterQuestions = questionRepository.findByTitle("Rate Limiter");

            Question question1 = !easyQuestions.isEmpty() ? easyQuestions.get(0) : null;
            Question question2 = !mediumQuestions.isEmpty() ? mediumQuestions.get(0) : null;
            Question rateLimiterQuestion = !rateLimiterQuestions.isEmpty() ? rateLimiterQuestions.get(0) : null;

            if (question1 != null && question2 != null && rateLimiterQuestion != null && interviewer != null && candidate1 != null && candidate2 != null && company != null) {
                // Create "in_progress" interview for testing chat
                Interview interview1 = new Interview();
                interview1.setCompany(company);
                interview1.setCandidate(candidate1);
                interview1.setQuestion(question1);
                interview1.setInterviewer(interviewer);
                interview1.setLanguage("java");
                interview1.setStatus("in_progress");
                interview1.setInterviewLinkToken(UUID.randomUUID().toString());
                interview1.setScheduledAt(LocalDateTime.now());
                interview1.setStartedAt(LocalDateTime.now());
                interview1 = interviewRepository.save(interview1);
                log.info("Created in_progress interview: {} (Token: {})", interview1.getId(), interview1.getInterviewLinkToken());

                // Create "scheduled" interview
                Interview interview2 = new Interview();
                interview2.setCompany(company);
                interview2.setCandidate(candidate2);
                interview2.setQuestion(question2);
                interview2.setInterviewer(interviewer);
                interview2.setLanguage("python");
                interview2.setStatus("scheduled");
                interview2.setInterviewLinkToken(UUID.randomUUID().toString());
                interview2.setScheduledAt(LocalDateTime.now().plusHours(1));
                interview2 = interviewRepository.save(interview2);
                log.info("Created scheduled interview: {} (Token: {})", interview2.getId(), interview2.getInterviewLinkToken());

                // Create Rate Limiter "in_progress" interview
                Interview rateLimiterInterview = new Interview();
                rateLimiterInterview.setCompany(company);
                rateLimiterInterview.setCandidate(candidate1);
                rateLimiterInterview.setQuestion(rateLimiterQuestion);
                rateLimiterInterview.setInterviewer(interviewer);
                rateLimiterInterview.setLanguage("javascript");
                rateLimiterInterview.setStatus("in_progress");
                rateLimiterInterview.setInterviewLinkToken(UUID.randomUUID().toString());
                rateLimiterInterview.setScheduledAt(LocalDateTime.now());
                rateLimiterInterview.setStartedAt(LocalDateTime.now());
                rateLimiterInterview = interviewRepository.save(rateLimiterInterview);
                log.info("Created Rate Limiter in_progress interview: {} (Token: {})", rateLimiterInterview.getId(), rateLimiterInterview.getInterviewLinkToken());

                // Log URLs for easy testing
                log.info("================== TEST INTERVIEWS CREATED ==================");
                log.info("Test Candidate Page (Chat Enabled): http://localhost:3000/i/{}", interview1.getInterviewLinkToken());
                log.info("Interviewer Page: http://localhost:3000/interview/{}", interview1.getId());
                log.info("Rate Limiter Test Page: http://localhost:3000/i/{}", rateLimiterInterview.getInterviewLinkToken());
                log.info("Rate Limiter Interviewer Page: http://localhost:3000/interview/{}", rateLimiterInterview.getId());
                log.info("===========================================================");
            } else {
                log.warn("Cannot create test interviews. Missing required data:");
                log.warn("  Company: {}, Interviewer: {}, Candidate1: {}, Candidate2: {}, Questions: {}, {}, RateLimiter: {}",
                    company != null, interviewer != null, candidate1 != null, candidate2 != null,
                    question1 != null, question2 != null, rateLimiterQuestion != null);
            }
        } catch (Exception e) {
            log.error("Error seeding test interviews", e);
        }
    }

    private Company createTestCompany() {
        Company company = new Company();
        company.setName("Test Tech Company");
        company.setEmail("test@company.com");
        company.setSubscriptionTier("starter");
        company = companyRepository.save(company);
        log.info("Created test company: {} (ID: {})", company.getName(), company.getId());
        return company;
    }

    private Candidate createCandidate(String name, String email) {
        Candidate candidate = new Candidate();
        candidate.setName(name);
        candidate.setEmail(email);
        candidate = candidateRepository.save(candidate);
        log.info("Created test candidate: {} (ID: {})", candidate.getName(), candidate.getId());
        return candidate;
    }
}
