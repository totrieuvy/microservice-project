package com.example.payment_service.service;

import java.util.Map;

public interface PaymentService {
    String createPaymentUrl(Long bookingId, Double amount) throws Exception;
    String handleVnPayCallback(Map<String, String> params);
}
