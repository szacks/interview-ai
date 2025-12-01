package com.example.interviewAI.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

@Slf4j
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Send password reset email to user
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        try {
            // Build reset link
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            // Email content
            String subject = "Reset Your InterviewAI Password";
            String body = buildPasswordResetEmailBody(userName, resetLink);

            // Send email
            if (mailSender != null) {
                try {
                    sendEmail(toEmail, subject, body);
                    log.info("Password reset email sent successfully to: {}", toEmail);
                } catch (Exception e) {
                    log.error("Error sending email via mail sender to: {}", toEmail, e);
                    log.info("Dev Mode: Reset link for {}: {}", toEmail, resetLink);
                    // Don't throw - allow password reset flow to continue
                }
            } else {
                log.warn("Mail sender not configured (RESEND_API_KEY or MAIL configuration missing)");
                log.info("Dev Mode: Password reset link for user {}: {}", toEmail, resetLink);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendPasswordResetEmail for: {}", toEmail, e);
            // Don't throw - allow password reset flow to continue
        }
    }

    /**
     * Send a simple email
     */
    private void sendEmail(String to, String subject, String text) throws Exception {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    /**
     * Send invitation email to new interviewer
     */
    public void sendInvitationEmail(String toEmail, String invitedByName, String companyName, String invitationLink) {
        try {
            // Email content
            String subject = "You're invited to join " + companyName + " on InterviewAI";
            String body = buildInvitationEmailBody(invitedByName, companyName, invitationLink);

            // Send email
            if (mailSender != null) {
                try {
                    sendEmail(toEmail, subject, body);
                    log.info("Invitation email sent successfully to: {}", toEmail);
                } catch (Exception e) {
                    log.error("Error sending email via mail sender to: {}", toEmail, e);
                    log.info("Dev Mode: Invitation link for {}: {}", toEmail, invitationLink);
                    // Don't throw - allow invitation flow to continue
                }
            } else {
                log.warn("Mail sender not configured (RESEND_API_KEY or MAIL configuration missing)");
                log.info("Dev Mode: Invitation link for user {}: {}", toEmail, invitationLink);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInvitationEmail for: {}", toEmail, e);
            // Don't throw - allow invitation flow to continue
        }
    }

    /**
     * Build password reset email body
     */
    private String buildPasswordResetEmailBody(String userName, String resetLink) {
        return "Hello " + userName + ",\n\n" +
                "We received a request to reset your InterviewAI password.\n\n" +
                "Click the link below to reset your password:\n" +
                resetLink + "\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you didn't request a password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "InterviewAI Team";
    }

    /**
     * Build invitation email body
     */
    private String buildInvitationEmailBody(String invitedByName, String companyName, String invitationLink) {
        return "Hello,\n\n" +
                invitedByName + " has invited you to join " + companyName + " on InterviewAI.\n\n" +
                "Click the link below to accept the invitation and set up your account:\n" +
                invitationLink + "\n\n" +
                "This link will expire in 7 days.\n\n" +
                "If you didn't expect this invitation, you can safely ignore this email.\n\n" +
                "Best regards,\n" +
                "InterviewAI Team";
    }

    /**
     * Send interview scheduled notification to candidate
     */
    public void sendInterviewScheduledEmail(String candidateEmail, String candidateName, String companyName,
                                           String questionTitle, String interviewLink, String scheduledTime) {
        try {
            String subject = "You've Been Scheduled for an Interview - " + companyName;
            String body = buildInterviewScheduledEmailBody(candidateName, companyName, questionTitle,
                                                          interviewLink, scheduledTime);

            if (mailSender != null) {
                try {
                    sendEmail(candidateEmail, subject, body);
                    log.info("Interview scheduled email sent successfully to: {}", candidateEmail);
                } catch (Exception e) {
                    log.error("Error sending interview scheduled email to: {}", candidateEmail, e);
                    log.info("Dev Mode: Interview link for {}: {}", candidateEmail, interviewLink);
                }
            } else {
                log.warn("Mail sender not configured");
                log.info("Dev Mode: Interview link for {}: {} (Scheduled: {})", candidateEmail, interviewLink, scheduledTime);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInterviewScheduledEmail for: {}", candidateEmail, e);
        }
    }

    /**
     * Send interview completion notification to candidate
     */
    public void sendInterviewCompletedEmail(String candidateEmail, String candidateName, String companyName) {
        try {
            String subject = "Interview Completed - " + companyName;
            String body = buildInterviewCompletedEmailBody(candidateName, companyName);

            if (mailSender != null) {
                try {
                    sendEmail(candidateEmail, subject, body);
                    log.info("Interview completed email sent successfully to: {}", candidateEmail);
                } catch (Exception e) {
                    log.error("Error sending interview completed email to: {}", candidateEmail, e);
                }
            } else {
                log.warn("Mail sender not configured");
                log.info("Dev Mode: Interview completed notification for user: {}", candidateEmail);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInterviewCompletedEmail for: {}", candidateEmail, e);
        }
    }

    /**
     * Send interview evaluation complete notification with results
     */
    public void sendInterviewEvaluationEmail(String candidateEmail, String candidateName, String companyName,
                                            String resultLink) {
        try {
            String subject = "Your Interview Results - " + companyName;
            String body = buildInterviewEvaluationEmailBody(candidateName, companyName, resultLink);

            if (mailSender != null) {
                try {
                    sendEmail(candidateEmail, subject, body);
                    log.info("Interview evaluation email sent successfully to: {}", candidateEmail);
                } catch (Exception e) {
                    log.error("Error sending interview evaluation email to: {}", candidateEmail, e);
                    log.info("Dev Mode: Results link for {}: {}", candidateEmail, resultLink);
                }
            } else {
                log.warn("Mail sender not configured");
                log.info("Dev Mode: Interview evaluation results link for {}: {}", candidateEmail, resultLink);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInterviewEvaluationEmail for: {}", candidateEmail, e);
        }
    }

    /**
     * Build interview scheduled email body
     */
    private String buildInterviewScheduledEmailBody(String candidateName, String companyName, String questionTitle,
                                                    String interviewLink, String scheduledTime) {
        return "Hello " + candidateName + ",\n\n" +
                "Great news! " + companyName + " has scheduled you for an interview.\n\n" +
                "Interview Details:\n" +
                "Company: " + companyName + "\n" +
                "Question: " + questionTitle + "\n" +
                "Scheduled Time: " + scheduledTime + "\n\n" +
                "You can access your interview at the following link:\n" +
                interviewLink + "\n\n" +
                "Please make sure you have a stable internet connection and a quiet environment.\n\n" +
                "Best regards,\n" +
                "InterviewAI Team";
    }

    /**
     * Build interview completed email body
     */
    private String buildInterviewCompletedEmailBody(String candidateName, String companyName) {
        return "Hello " + candidateName + ",\n\n" +
                "Your interview with " + companyName + " has been completed.\n\n" +
                "Thank you for participating in the interview. We appreciated your time and effort.\n\n" +
                "You will receive your evaluation results shortly. In the meantime, if you have any questions, " +
                "please feel free to reach out.\n\n" +
                "Best regards,\n" +
                "InterviewAI Team";
    }

    /**
     * Build interview evaluation email body
     */
    private String buildInterviewEvaluationEmailBody(String candidateName, String companyName, String resultLink) {
        return "Hello " + candidateName + ",\n\n" +
                "Your interview results from " + companyName + " are now available.\n\n" +
                "Click the link below to view your detailed evaluation:\n" +
                resultLink + "\n\n" +
                "Thank you for your participation. Good luck with your next steps!\n\n" +
                "Best regards,\n" +
                "InterviewAI Team";
    }
}
