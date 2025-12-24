package com.example.booking_service.dto.request;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BookingRequest {

    private Date bookingDate;
    private String staffId;

    // ⏰ time dùng chung cho toàn booking
    private String startTime;
    private String endTime;

    private String paymentMethod;

    private Long slotId;

    // 🔥 NEW: nhiều hamster trong 1 booking
    private List<BookingItemRequest> items;

    @Data
    public static class BookingItemRequest {
        private String hamsterId;
        private List<ServiceItemRequest> services;
    }

    @Data
    public static class ServiceItemRequest {
        private Long serviceId;
        private String serviceName;
        private Double servicePrice;
        private Integer discount;
    }
}
