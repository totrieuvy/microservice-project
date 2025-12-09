package com.example.booking_service.dto.response;

import lombok.Data;

@Data
public class BookingPaymentResponse {
    private String paymentMethod;
    private String responseCode;
}

