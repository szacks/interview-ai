package com.example.interviewAI.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

/**
 * Email service for sending transactional emails.
 * Uses JavaMailSender with graceful fallback for development.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * Send password reset email to user.
     */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        try {
            // Build reset link
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            // Email content
            String subject = "Reset Your InterviewAI Password";
            String body = buildPasswordResetEmailBody(userName, resetLink);

            // Send email
            try {
                sendEmail(toEmail, subject, body);
                log.info("Password reset email sent successfully to: {}", toEmail);
            } catch (Exception e) {
                log.error("Error sending email via mail sender to: {}", toEmail, e);
                log.info("Dev Mode: Reset link for {}: {}", toEmail, resetLink);
                // Don't throw - allow password reset flow to continue
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendPasswordResetEmail for: {}", toEmail, e);
            // Don't throw - allow password reset flow to continue
        }
    }

    /**
     * Send a simple email.
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
     * Build HTML email body for password reset.
     */
    private String buildPasswordResetEmailBody(String userName, String resetLink) {
        return String.format("""
                Hello %s,

                You recently requested to reset your password for your InterviewAI account.

                Click the link below to reset your password:
                %s

                This link will expire in 1 hour.

                If you did not request a password reset, please ignore this email.

                Best regards,
                The InterviewAI Team
                """, userName, resetLink);
    }

    /**
     * Send team invitation email.
     */
    public void sendInvitationEmail(String toEmail, String inviterName, String companyName, String invitationToken) {
        try {
            String invitationLink = frontendUrl + "/accept-invitation?token=" + invitationToken;

            String subject = "You're invited to join " + companyName + " on InterviewAI";
            String body = buildInvitationEmailBody(inviterName, companyName, invitationLink);

            try {
                sendEmail(toEmail, subject, body);
                log.info("Invitation email sent successfully to: {}", toEmail);
            } catch (Exception e) {
                log.error("Error sending invitation email to: {}", toEmail, e);
                log.info("Dev Mode: Invitation link for {}: {}", toEmail, invitationLink);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInvitationEmail for: {}", toEmail, e);
        }
    }

    /**
     * Build email body for team invitation.
     */
    private String buildInvitationEmailBody(String inviterName, String companyName, String invitationLink) {
        return String.format("""
                Hello,

                %s has invited you to join %s on InterviewAI.

                Click the link below to accept the invitation and create your account:
                %s

                This invitation will expire in 7 days.

                Best regards,
                The InterviewAI Team
                """, inviterName, companyName, invitationLink);
    }

    /**
     * Send interview scheduled email to candidate.
     */
    public void sendInterviewScheduledEmail(String toEmail, String candidateName, String companyName, String questionTitle, String interviewLink, String scheduledTime) {
        try {
            String subject = "Your Interview is Scheduled - " + companyName;
            String body = buildInterviewScheduledEmailBody(candidateName, companyName, questionTitle, interviewLink, scheduledTime);

            try {
                sendEmail(toEmail, subject, body);
                log.info("Interview scheduled email sent successfully to: {}", toEmail);
            } catch (Exception e) {
                log.error("Error sending interview scheduled email to: {}", toEmail, e);
                log.info("Dev Mode: Interview link for {}: {}", toEmail, interviewLink);
            }
        } catch (Exception e) {
            log.error("Unexpected error in sendInterviewScheduledEmail for: {}", toEmail, e);
        }
    }

    /**
     * Build email body for interview scheduled notification.
     */
    private String buildInterviewScheduledEmailBody(String candidateName, String companyName, String questionTitle, String interviewLink, String scheduledTime) {
        return String.format("""
                Hello %s,

                Your interview with %s has been scheduled!

                Question: %s
                Scheduled Time: %s

                Click the link below to access your interview:
                %s

                Best regards,
                The InterviewAI Team
                """, candidateName, companyName, questionTitle, scheduledTime, interviewLink);
    }
}
