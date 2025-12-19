package com.example.booking_service.exception;

public class AppointmentServiceException extends RuntimeException {
    public AppointmentServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
