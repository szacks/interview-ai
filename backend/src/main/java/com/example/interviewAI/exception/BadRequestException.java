package com.example.interviewAI.exception;

/**
 * Exception thrown when a request contains invalid data or parameters.
 * Returns HTTP 400 status code.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
