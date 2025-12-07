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

            Question question1 = !easyQuestions.isEmpty() ? easyQuestions.get(0) : null;
            Question question2 = !mediumQuestions.isEmpty() ? mediumQuestions.get(0) : null;

            if (question1 != null && question2 != null && interviewer != null && candidate1 != null && candidate2 != null && company != null) {
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

                // Log URLs for easy testing
                log.info("================== TEST INTERVIEWS CREATED ==================");
                log.info("Test Candidate Page (Chat Enabled): http://localhost:3000/i/{}", interview1.getInterviewLinkToken());
                log.info("Interviewer Page: http://localhost:3000/interview/{}", interview1.getId());
                log.info("Interview ID for chat testing: {}", interview1.getId());
                log.info("===========================================================");
            } else {
                log.warn("Cannot create test interviews. Missing required data:");
                log.warn("  Company: {}, Interviewer: {}, Candidate1: {}, Candidate2: {}, Questions: {}, {}",
                    company != null, interviewer != null, candidate1 != null, candidate2 != null,
                    question1 != null, question2 != null);
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
