package com.example.booking_service.dto.response;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class BookingFullResponse {

    private Long id;
    private String userId;

    private String hamsterId;

    private Date bookingDate;
    private String startTime;
    private String endTime;

    private Double totalBasePrice;
    private Double totalFinalPrice;
    private String status;

    private List<BookingDetailResponse> details;

    private BookingPaymentResponse payment;

    private BookingTimelineResponse timeline;
}
