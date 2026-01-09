package com.example.interviewAI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration to properly handle static resources and API routes.
 * Ensures that /api/** routes are not treated as static resources.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * Configure resource handlers to exclude API routes from static resource handling.
     * This ensures that /api/** paths are routed to controllers instead of the static resource handler.
     *
     * We explicitly register handlers for /static and /public, but NOT for /** to avoid
     * the default resource handler from catching all unmapped requests.
     */
    @Override
    public void addResourceHandlers(@org.springframework.lang.NonNull ResourceHandlerRegistry registry) {
        // Register handlers for specific static resource paths only
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        registry.addResourceHandler("/public/**")
                .addResourceLocations("classpath:/public/");

        // Important: Do NOT call registry.addResourceHandler("/**")
        // This prevents the catch-all handler from intercepting /api/** requests
    }
}
