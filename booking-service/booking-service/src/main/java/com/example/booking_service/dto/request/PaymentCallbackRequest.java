package com.example.booking_service.dto.request;

import lombok.Data;

@Data
public class PaymentCallbackRequest {
    private Long bookingId;
    private String responseCode;
}
