package com.example.interviewAI.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a chat message in an interview session.
 * Stores messages from candidates, AI assistant, and system notifications.
 */
@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_interview", columnList = "interview_id"),
    @Index(name = "idx_chat_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    /**
     * Role of the message sender: "candidate", "ai", or "system"
     */
    @Column(nullable = false, length = 20)
    private String role;

    /**
     * Message content
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    /**
     * Timestamp when message was created
     */
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Display name of the sender
     */
    @Column(length = 100)
    private String senderName;

    /**
     * Whether the message has been read by the recipient
     */
    @Column(nullable = false)
    private Boolean isRead = false;

    /**
     * Automatically set timestamp on entity creation
     */
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
