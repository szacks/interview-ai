package com.example.interviewAI.exception;

/**
 * Exception thrown when a user is authenticated but lacks permission to access a resource.
 * Returns HTTP 403 status code.
 */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}
