package com.example.user_service.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {
        super("error.user.not_found"); // KEY not text
    }
}
