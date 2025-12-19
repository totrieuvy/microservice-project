package com.example.booking_service.exception;

public class SlotLockedException extends RuntimeException {
    public SlotLockedException(String message) {
        super(message);
    }
}

