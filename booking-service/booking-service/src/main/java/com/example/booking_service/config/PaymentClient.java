package com.example.booking_service.config;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class PaymentClient {

    private final RestTemplate restTemplate;

    public String createVnpayPayment(Long bookingId, double amount) {
        String url = "http://payment-service/api/payments/create"
                + "?bookingId=" + bookingId
                + "&amount=" + amount;

        return restTemplate.postForObject(url, null, String.class);
    }
}
