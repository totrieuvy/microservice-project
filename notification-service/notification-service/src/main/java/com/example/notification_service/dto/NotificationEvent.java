package com.example.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEvent {
    private String fcmToken;
    private String title;
    private String body;
    private String image;
}

