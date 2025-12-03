package com.example.interviewAI.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

/**
 * WebSocket Configuration with STOMP support for real-time interview communication.
 * Enables bidirectional communication between interviewer and candidate.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${spring.security.cors.allowed-origins}")
    private String allowedOrigins;

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
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Parse allowed origins from comma-separated string
        String[] origins = allowedOrigins.split(",");
        String[] trimmedOrigins = new String[origins.length];
        for (int i = 0; i < origins.length; i++) {
            trimmedOrigins[i] = origins[i].trim();
        }

        // Register WebSocket endpoint
        registry.addEndpoint("/ws/interview")
                .setAllowedOrigins(trimmedOrigins)
                .addInterceptors(new HttpSessionHandshakeInterceptor())
                .withSockJS();

        // Alternative endpoint without SockJS fallback (for direct WebSocket)
        registry.addEndpoint("/ws/interview")
                .setAllowedOrigins(trimmedOrigins)
                .addInterceptors(new HttpSessionHandshakeInterceptor());
    }
}
