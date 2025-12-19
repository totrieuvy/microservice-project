package com.example.booking_service.exception;

public class SlotFullException extends RuntimeException {
    public SlotFullException(String message) {
        super(message);
    }
}
