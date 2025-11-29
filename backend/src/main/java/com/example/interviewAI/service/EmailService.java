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

    @Value("${app.mail.from:noreply@interviewai.com}")
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
}
