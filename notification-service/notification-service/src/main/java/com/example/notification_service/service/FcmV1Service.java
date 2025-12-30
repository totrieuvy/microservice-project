package com.example.notification_service.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FcmV1Service {

    public String sendNotification(
            String token,
            String title,
            String body,
            String image
    ) {
        try {

            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .setImage(image)
                                    .build()
                    )
                    .build();

            return FirebaseMessaging.getInstance().send(message);

        } catch (FirebaseMessagingException e) {
            throw new RuntimeException("Failed to send FCM notification", e);
        }
    }
}

