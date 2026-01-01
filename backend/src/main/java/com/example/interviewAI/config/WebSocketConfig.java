package com.example.interviewAI.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

/**
 * WebSocket Configuration with STOMP support for real-time interview communication.
 * Enables bidirectional communication between interviewer and candidate.
 * Uses CorsProperties for consistent CORS handling.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final CorsProperties corsProperties;

    /**
     * Configure message broker for WebSocket communication.
     * Sets up destination prefixes for message routing.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple in-memory message broker
        config.enableSimpleBroker("/topic", "/queue");

        // Set the prefix for messages sent by the client to methods annotated with @MessageMapping
        config.setApplicationDestinationPrefixes("/app");

        // Enable user-specific message destinations (/user/{username}/queue/...)
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints.
     * Clients will connect to /ws/interview endpoint.
     * Uses allowed origins from CorsProperties for consistency.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] allowedOrigins = corsProperties.getAllowedOrigins().toArray(new String[0]);

        // Register WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws/interview")
                .setAllowedOrigins(allowedOrigins)
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .withSockJS();

        // Alternative endpoint without SockJS fallback (for direct WebSocket)
        registry.addEndpoint("/ws/interview")
                .setAllowedOrigins(allowedOrigins)
                .addInterceptors(new HttpSessionHandshakeInterceptor());
    }
}
