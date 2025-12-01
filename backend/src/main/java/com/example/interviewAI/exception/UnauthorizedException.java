package com.example.interviewAI.exception;

/**
 * Exception thrown when authentication fails or is missing.
 * Returns HTTP 401 status code.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
