package com.example.notification_service.config;

import com.example.notification_service.dto.NotificationEvent;
import com.example.notification_service.service.FcmV1Service;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final FcmV1Service fcmV1Service;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(NotificationEvent event) {
        fcmV1Service.sendNotification(
                event.getFcmToken(),
                event.getTitle(),
                event.getBody(),
                event.getImage()
        );
    }
}