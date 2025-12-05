package com.example.booking_service.dto.request;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BookingRequest {

    private Long hamsterId;
    private Date bookingDate;
    private String staffId;

    private String startTime;
    private String endTime;

    private List<ServiceItem> services;

    private String paymentMethod;

    @Data
    public static class ServiceItem {
        private Long serviceId;
        private String serviceName;
        private Double servicePrice;
        private Integer discount;
    }
}

