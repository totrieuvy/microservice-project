package com.example.booking_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationEvent {
    private String type;        // BOOKING_PAID
    private String title;
    private String body;
    private String image;
    private String fcmToken;    // ✅ PUSH THẲNG
}


