package com.example.notification_service.controller;

import com.example.notification_service.dto.OtpRequest;
import com.example.notification_service.service.impl.NotificationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationServiceImpl notificationService;

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(@RequestBody OtpRequest request) {
        notificationService.sendOtp(
                request.getUserId(),
                request.getEmail(),
                request.getName(),
                request.getActivationToken()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verifyOtp(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String otp = request.get("otp").toString();
        return ResponseEntity.ok(notificationService.verifyOtp(userId, otp));
    }


}

