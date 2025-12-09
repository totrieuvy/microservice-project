package com.example.booking_service.service;

import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Qualifier;


import java.io.FileInputStream;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.io.ClassPathResource;


@Service
public class FcmV1Service {

    @Qualifier("externalRestTemplate")
    private final RestTemplate restTemplate;

    @Autowired
    public FcmV1Service(@Qualifier("externalRestTemplate") RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private static final String PROJECT_ID = "course-ac11b";

    // Gửi notification
    public void sendNotification(String token, String title, String body, String imageBase64) {
        try {
            String url = "https://fcm.googleapis.com/v1/projects/" + PROJECT_ID + "/messages:send";

            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            // Notification body
            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("body", body);
            notification.put("image", imageBase64);

            // Message wrapper
            Map<String, Object> message = new HashMap<>();
            message.put("token", token);
            message.put("notification", notification);

            Map<String, Object> request = new HashMap<>();
            request.put("message", message);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            restTemplate.postForObject(url, entity, String.class);

        } catch (Exception e) {
            System.out.println("🔥 FCM v1 ERROR: " + e.getMessage());
        }
    }

    // Lấy access token từ service account JSON
    private String getAccessToken() throws Exception {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new ClassPathResource("firebase-service-account.json").getInputStream())
                .createScoped("https://www.googleapis.com/auth/cloud-platform");

        credentials.refreshIfExpired();
        return credentials.getAccessToken().getTokenValue();
    }
}
