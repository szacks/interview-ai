package com.example.interviewAI.seeder;

import com.example.interviewAI.entity.Candidate;
import com.example.interviewAI.entity.Company;
import com.example.interviewAI.entity.Interview;
import com.example.interviewAI.entity.Question;
import com.example.interviewAI.entity.TestCase;
import com.example.interviewAI.entity.User;
import com.example.interviewAI.enums.RoleEnum;
import com.example.interviewAI.repository.CandidateRepository;
import com.example.interviewAI.repository.CompanyRepository;
import com.example.interviewAI.repository.InterviewRepository;
import com.example.interviewAI.repository.QuestionRepository;
import com.example.interviewAI.repository.TestCaseRepository;
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
    private TestCaseRepository testCaseRepository;

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

        // Always ensure Docker test interview exists for testing
        createDockerTestInterview();
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
                log.info("Rate Limiter interview already exists, updating question code templates and interviewer");
                // Update the Rate Limiter question with new code templates
                updateRateLimiterQuestion();
                // Update interviewer and company for all Rate Limiter interviews to use shaniravia@gmail.com
                updateRateLimiterInterviewers();
                return;
            }

            // Get shaniravia@gmail.com user to ensure we use her company
            User shaniraviaUser = null;
            java.util.List<User> allUsers = (java.util.List<User>) userRepository.findAll();
            for (User user : allUsers) {
                if ("shaniravia@gmail.com".equals(user.getEmail())) {
                    shaniraviaUser = user;
                    log.info("Found shaniravia@gmail.com (ID: {}, Company: {})", user.getId(),
                            user.getCompany() != null ? user.getCompany().getId() : "null");
                    break;
                }
            }

            // Get company from shaniravia if found, otherwise use first company
            Company company = null;
            if (shaniraviaUser != null && shaniraviaUser.getCompany() != null) {
                company = shaniraviaUser.getCompany();
                log.info("Using shaniravia's company: {} (ID: {})", company.getName(), company.getId());
            } else {
                java.util.List<Company> companies = (java.util.List<Company>) companyRepository.findAll();
                if (companies.isEmpty()) {
                    log.warn("No companies found, cannot create Rate Limiter interview");
                    return;
                }
                company = companies.get(0);
                log.info("Using first company: {} (ID: {})", company.getName(), company.getId());
            }

            // Use shaniravia as interviewer if found, otherwise get first interviewer
            User interviewer = shaniraviaUser;
            if (interviewer == null) {
                for (User user : allUsers) {
                    if (user.getRole() == RoleEnum.INTERVIEWER) {
                        interviewer = user;
                        break;
                    }
                }
            }
            if (interviewer == null && !allUsers.isEmpty()) {
                interviewer = allUsers.get(0);
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

    private void updateRateLimiterInterviewers() {
        try {
            // Find shaniravia@gmail.com user
            User targetInterviewer = null;
            java.util.List<User> allUsers = (java.util.List<User>) userRepository.findAll();
            for (User user : allUsers) {
                if ("shaniravia@gmail.com".equals(user.getEmail())) {
                    targetInterviewer = user;
                    break;
                }
            }

            if (targetInterviewer == null) {
                log.warn("shaniravia@gmail.com user not found, cannot update Rate Limiter interview interviewer");
                return;
            }

            if (targetInterviewer.getCompany() == null) {
                log.warn("shaniravia@gmail.com user has no company assigned, cannot update Rate Limiter interviews");
                return;
            }

            // Update all Rate Limiter interviews to have shaniravia@gmail.com as interviewer and her company
            java.util.List<Interview> rateLimiterInterviews = interviewRepository.findAll().stream()
                    .filter(i -> i.getQuestion() != null && "Rate Limiter".equals(i.getQuestion().getTitle()))
                    .collect(java.util.stream.Collectors.toList());

            for (Interview interview : rateLimiterInterviews) {
                interview.setInterviewer(targetInterviewer);
                interview.setCompany(targetInterviewer.getCompany());
                interviewRepository.save(interview);
                log.info("Updated Rate Limiter interview {} - Interviewer: shaniravia@gmail.com (ID: {}), Company: {} (ID: {})",
                        interview.getId(), targetInterviewer.getId(), targetInterviewer.getCompany().getName(), targetInterviewer.getCompany().getId());
            }
        } catch (Exception e) {
            log.error("Error updating Rate Limiter interview interviewers", e);
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
            rateLimiter.setDescription("Build a rate limiter that controls how many requests are allowed in a time window.\n" +
                    "\n" +
                    "EXAMPLE:\n" +
                    "const limiter = new RateLimiter(3, 1000); // 3 requests per second\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // true\n" +
                    "limiter.allowRequest(); // false (limit reached)\n" +
                    "// After 1 second passes, requests are allowed again");

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

    private void createDockerTestInterview() {
        try {
            // Check if "Reverse String" question already exists
            java.util.List<Question> questions = questionRepository.findByTitle("Reverse String");
            if (!questions.isEmpty()) {
                log.info("Reverse String question already exists, skipping Docker test interview creation");
                return;
            }

            // Create "Reverse String" Question for Docker testing
            Question reverseStringQuestion = new Question();
            reverseStringQuestion.setTitle("Reverse String");
            reverseStringQuestion.setDescription("Write a function that reverses a string.\n\n" +
                    "FUNCTION TO IMPLEMENT:\n\n" +
                    "reverseString(str)\n" +
                    "   - Takes a string as input\n" +
                    "   - Returns the reversed string\n\n" +
                    "EXAMPLES:\n" +
                    "   reverseString('hello') → 'olleh'\n" +
                    "   reverseString('') → ''\n" +
                    "   reverseString('a') → 'a'");
            reverseStringQuestion.setDifficulty("easy");
            reverseStringQuestion.setTimeLimitMinutes(15);
            reverseStringQuestion.setSupportedLanguages("javascript,python,java");
            reverseStringQuestion.setTestsJson("[]");

            // Set initial code templates
            reverseStringQuestion.setInitialCodeJavascript(
                    "// Reverse a string\n\n" +
                    "function reverseString(str) {\n" +
                    "  // TODO: Implement string reversal\n" +
                    "  return str;\n" +
                    "}\n");

            reverseStringQuestion.setInitialCodePython(
                    "# Reverse a string\n\n" +
                    "def reverse_string(s):\n" +
                    "    # TODO: Implement string reversal\n" +
                    "    return s\n");

            reverseStringQuestion.setInitialCodeJava(
                    "// Reverse a string\n\n" +
                    "public class Solution {\n" +
                    "    public static String reverseString(String str) {\n" +
                    "        // TODO: Implement string reversal\n" +
                    "        return str;\n" +
                    "    }\n" +
                    "}\n");

            reverseStringQuestion.setRequirementsJson("{}");
            reverseStringQuestion.setRubricJson("{}");

            reverseStringQuestion = questionRepository.save(reverseStringQuestion);
            log.info("Created Reverse String question for Docker testing (ID: {})", reverseStringQuestion.getId());

            // Create test cases
            TestCase tc1 = new TestCase();
            tc1.setQuestion(reverseStringQuestion);
            tc1.setTestName("Reverse 'hello'");
            tc1.setTestCase("TC1");
            tc1.setDescription("Basic string reversal");
            tc1.setOrderIndex(0);
            tc1.setOperationsJson("[{\"method\": \"reverseString\", \"args\": [\"hello\"], \"store\": \"result\"}]");
            tc1.setAssertionsJson("{\"result\": \"olleh\"}");
            testCaseRepository.save(tc1);
            log.info("Created test case: Reverse 'hello'");

            TestCase tc2 = new TestCase();
            tc2.setQuestion(reverseStringQuestion);
            tc2.setTestName("Reverse 'world'");
            tc2.setTestCase("TC2");
            tc2.setDescription("Reverse another string");
            tc2.setOrderIndex(1);
            tc2.setOperationsJson("[{\"method\": \"reverseString\", \"args\": [\"world\"], \"store\": \"result\"}]");
            tc2.setAssertionsJson("{\"result\": \"dlrow\"}");
            testCaseRepository.save(tc2);
            log.info("Created test case: Reverse 'world'");

            TestCase tc3 = new TestCase();
            tc3.setQuestion(reverseStringQuestion);
            tc3.setTestName("Reverse empty string");
            tc3.setTestCase("TC3");
            tc3.setDescription("Edge case: empty string");
            tc3.setOrderIndex(2);
            tc3.setOperationsJson("[{\"method\": \"reverseString\", \"args\": [\"\"], \"store\": \"result\"}]");
            tc3.setAssertionsJson("{\"result\": \"\"}");
            testCaseRepository.save(tc3);
            log.info("Created test case: Reverse empty string");

            // Create test users
            Company testCompany = createOrGetCompany("Docker Test Company");
            User testInterviewer = createOrGetUser("docker.interviewer@test.com", "Docker Interviewer", RoleEnum.INTERVIEWER, testCompany);
            Candidate testCandidate = createCandidate("Docker Test Candidate", "docker.candidate@test.com");

            // Create in_progress interview for testing
            Interview dockerTestInterview = new Interview();
            dockerTestInterview.setCompany(testCompany);
            dockerTestInterview.setCandidate(testCandidate);
            dockerTestInterview.setQuestion(reverseStringQuestion);
            dockerTestInterview.setInterviewer(testInterviewer);
            dockerTestInterview.setLanguage("javascript");
            dockerTestInterview.setStatus("in_progress");
            dockerTestInterview.setInterviewLinkToken(UUID.randomUUID().toString());
            dockerTestInterview.setScheduledAt(LocalDateTime.now());
            dockerTestInterview.setStartedAt(LocalDateTime.now());
            dockerTestInterview = interviewRepository.save(dockerTestInterview);

            log.info("✅ Created Docker test interview for 'Reverse String' question");
            log.info("   Interview ID: {}", dockerTestInterview.getId());
            log.info("   Test Candidate Page: http://localhost:3000/i/{}", dockerTestInterview.getInterviewLinkToken());
            log.info("   Interviewer Page: http://localhost:3000/interview/{}", dockerTestInterview.getId());
            log.info("   Test the Run Tests button to execute code in Docker!");

        } catch (Exception e) {
            log.error("Error creating Docker test interview", e);
        }
    }

    private Company createOrGetCompany(String name) {
        String email = name.toLowerCase().replace(" ", ".") + "@company.com";
        try {
            // Try to find existing company by email
            java.util.List<Company> companies = (java.util.List<Company>) companyRepository.findAll();
            for (Company c : companies) {
                if (email.equals(c.getEmail())) {
                    return c;
                }
            }
        } catch (Exception e) {
            log.warn("Error searching for existing company", e);
        }

        // Create new company if not found
        Company company = new Company();
        company.setName(name);
        company.setEmail(email);
        company.setSubscriptionTier("starter");
        return companyRepository.save(company);
    }

    private User createOrGetUser(String email, String name, RoleEnum role) {
        return createOrGetUser(email, name, role, null);
    }

    private User createOrGetUser(String email, String name, RoleEnum role, Company company) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                // If user exists and company is provided, update the company if not set
                if (company != null && user.getCompany() == null) {
                    user.setCompany(company);
                    user = userRepository.save(user);
                }
                return user;
            }
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setRole(role);
            user.setCompany(company);
            return userRepository.save(user);
        } catch (Exception e) {
            log.error("Error creating or getting user: {}", email, e);
            return null;
        }
    }
}
