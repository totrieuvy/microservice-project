package com.example.booking_service.dto.response;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BookingFullResponse {

    private Long id;
    private String userId;

    private Date bookingDate;
    private String startTime;
    private String endTime;

    private Double totalBasePrice;
    private Double totalFinalPrice;

    private String status;

    // 🔥 NEW: nhiều hamster
    private List<BookingItemResponse> items;

    private BookingPaymentResponse payment;
    private BookingTimelineResponse timeline;

    // ==========================
    // HAMSTER LEVEL
    // ==========================
    @Data
    public static class BookingItemResponse {
        private String hamsterId;
        private List<ServiceResponse> services;
    }

    // ==========================
    // SERVICE LEVEL
    // ==========================
    @Data
    public static class ServiceResponse {
        private Long serviceId;
        private String serviceName;
        private Double servicePrice;
        private Integer discount;
    }

    // ==========================
    // PAYMENT
    // ==========================
    @Data
    public static class BookingPaymentResponse {
        private String paymentMethod;
        private String responseCode;
    }

    // ==========================
    // TIMELINE
    // ==========================
    @Data
    public static class BookingTimelineResponse {
        private Date bookingTime;
        private Date paymentTime;
        private Date checkInTime;
        private Date checkOutTime;
        private Date completedTime;
        private String checkinUrl;
        private  String checkoutUrl;

    }
}
