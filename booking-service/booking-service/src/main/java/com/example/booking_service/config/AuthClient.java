package com.example.booking_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
        if (body == null || body.get("data") == null) {
            throw new RuntimeException("Cannot fetch current user");
        }

        return ((Map<String, Object>) body.get("data"))
                .get("email")
                .toString();
    }
}

