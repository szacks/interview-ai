package com.example.interviewAI.controller;

import com.example.interviewAI.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

/**
 * WebSocket Message Controller for handling real-time communication
 * during interviews. Manages code updates, chat messages, and test results.
 */
@Slf4j
@Controller
public class MessageController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handle code update messages from candidate.
     * Routes code updates to the interviewer.
     *
     * @param interviewId interview identifier
     * @param codeUpdate code update payload
     */
    @MessageMapping("/interview/{interviewId}/code")
    @SendTo("/topic/interview/{interviewId}/code")
    public WebSocketMessage handleCodeUpdate(
            @DestinationVariable Long interviewId,
            @Payload CodeUpdateMessage codeUpdate) {

        log.debug("Code update received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("code");
        message.setInterviewId(interviewId);
        message.setPayload(codeUpdate);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Handle chat messages between interviewer and candidate.
     * Routes chat messages to the interview topic.
     *
     * @param interviewId interview identifier
     * @param chatMessage chat message payload
     */
    @MessageMapping("/interview/{interviewId}/chat")
    @SendTo("/topic/interview/{interviewId}/chat")
    public WebSocketMessage handleChatMessage(
            @DestinationVariable Long interviewId,
            @Payload ChatMessageDTO chatMessage) {

        log.debug("Chat message received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("chat");
        message.setInterviewId(interviewId);
        message.setPayload(chatMessage);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Handle test execution results.
     * Routes test results to the interview topic.
     *
     * @param interviewId interview identifier
     * @param testResult test result payload
     */
    @MessageMapping("/interview/{interviewId}/test-result")
    @SendTo("/topic/interview/{interviewId}/test-result")
    public WebSocketMessage handleTestResult(
            @DestinationVariable Long interviewId,
            @Payload TestResultMessage testResult) {

        log.debug("Test result received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("test-result");
        message.setInterviewId(interviewId);
        message.setPayload(testResult);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Handle timer updates for interview countdown.
     * Routes timer updates to all connected clients.
     *
     * @param interviewId interview identifier
     * @param timerPayload timer payload with remaining time
     */
    @MessageMapping("/interview/{interviewId}/timer")
    @SendTo("/topic/interview/{interviewId}/timer")
    public WebSocketMessage handleTimerUpdate(
            @DestinationVariable Long interviewId,
            @Payload java.util.Map<String, Object> timerPayload) {

        log.debug("Timer update received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("timer");
        message.setInterviewId(interviewId);
        message.setPayload(timerPayload);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Handle interview status updates.
     * Routes status changes to all participants.
     *
     * @param interviewId interview identifier
     * @param statusPayload status payload
     */
    @MessageMapping("/interview/{interviewId}/status")
    @SendTo("/topic/interview/{interviewId}/status")
    public WebSocketMessage handleStatusUpdate(
            @DestinationVariable Long interviewId,
            @Payload java.util.Map<String, Object> statusPayload) {

        log.debug("Status update received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("status");
        message.setInterviewId(interviewId);
        message.setPayload(statusPayload);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Handle cursor position updates for real-time collaboration.
     *
     * @param interviewId interview identifier
     * @param cursorPayload cursor position payload
     */
    @MessageMapping("/interview/{interviewId}/cursor")
    @SendTo("/topic/interview/{interviewId}/cursor")
    public WebSocketMessage handleCursorUpdate(
            @DestinationVariable Long interviewId,
            @Payload java.util.Map<String, Object> cursorPayload) {

        log.debug("Cursor update received for interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("cursor");
        message.setInterviewId(interviewId);
        message.setPayload(cursorPayload);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Subscribe to interview updates.
     * Called when a client subscribes to interview topic.
     *
     * @param interviewId interview identifier
     * @return subscription confirmation message
     */
    @SubscribeMapping("/topic/interview/{interviewId}/updates")
    public WebSocketMessage onSubscribe(@DestinationVariable Long interviewId) {
        log.debug("Client subscribed to interview {}", interviewId);

        WebSocketMessage message = new WebSocketMessage();
        message.setType("subscription");
        message.setInterviewId(interviewId);
        message.setPayload("Connected to interview " + interviewId);
        message.setTimestamp(LocalDateTime.now());

        return message;
    }

    /**
     * Send message to specific user.
     * Used for private notifications.
     *
     * @param userId recipient user ID
     * @param message message to send
     */
    public void sendPrivateMessage(Long userId, WebSocketMessage message) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/messages",
                message
        );
    }

    /**
     * Broadcast message to all interview participants.
     *
     * @param interviewId interview identifier
     * @param message message to broadcast
     */
    public void broadcastMessage(Long interviewId, WebSocketMessage message) {
        messagingTemplate.convertAndSend(
                "/topic/interview/" + interviewId + "/updates",
                message
        );
    }
}
