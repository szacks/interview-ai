package com.example.interviewAI.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvironmentConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        // Set environment variables from .env file to system properties
        // This ensures Spring Boot can read them
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });
    }
}
