package com.example.booking_service.dto.response;

import lombok.Data;

@Data
public class BookingDetailResponse {
    private Long serviceId;
    private String serviceName;
    private Double servicePrice;
    private Integer discount;
}

