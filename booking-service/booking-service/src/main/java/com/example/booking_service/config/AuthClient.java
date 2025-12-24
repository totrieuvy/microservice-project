package com.example.booking_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class AuthClient {

    private final RestTemplate restTemplate;

    public String getCurrentUserEmail(String authHeader) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "http://auth-service/api/auth/current-user",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null) {
            throw new RuntimeException("Auth response body is null");
        }

        // ✅ CASE 1: auth-service trả trực tiếp email
        if (body.containsKey("email")) {
            return body.get("email").toString();
        }

        // ✅ CASE 2: auth-service trả { data: { email } }
        if (body.containsKey("data")) {
            Map<String, Object> data = (Map<String, Object>) body.get("data");
            if (data != null && data.containsKey("email")) {
                return data.get("email").toString();
            }
        }

        throw new RuntimeException("Email not found in auth response: " + body);
    }
}
