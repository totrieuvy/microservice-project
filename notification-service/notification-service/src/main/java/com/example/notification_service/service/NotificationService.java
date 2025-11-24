package com.example.notification_service.service;

public interface NotificationService {

    void sendOtp(Long userId, String email, String name, String activationToken);

    boolean verifyOtp(Long userId, String otp);
}
