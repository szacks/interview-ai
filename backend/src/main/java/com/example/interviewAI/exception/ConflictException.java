package com.example.interviewAI.exception;

/**
 * Exception thrown when a request conflicts with the current state of the server.
 * For example, when trying to create a resource that already exists.
 * Returns HTTP 409 status code.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
