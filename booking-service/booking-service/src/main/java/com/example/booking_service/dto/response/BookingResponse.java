package com.example.booking_service.dto.response;

import com.example.booking_service.entity.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class BookingResponse {

    private Long id;
    private String userId;
    private String hamsterId;

    private Date bookingDate;
    private String startTime;
    private String endTime;

    private Double totalBasePrice;
    private Double totalFinalPrice;

    private BookingStatus status;

    private List<BookingDetailResponse> details;

    private BookingPaymentResponse payment;
    private BookingTimelineResponse timeline;
    private String paymentUrl;



    // --------------------------
    // DETAIL RESPONSE
    // --------------------------
    @Data
    @Builder
    public static class BookingDetailResponse {
        private Long serviceId;
        private String serviceName;
        private Double servicePrice;
        private Integer discount;
    }

    // --------------------------
    // PAYMENT RESPONSE
    // --------------------------
    @Data
    @Builder
    public static class BookingPaymentResponse {
        private String paymentMethod;
        private String responseCode;
    }

    // --------------------------
    // TIMELINE RESPONSE
    // --------------------------
    @Data
    @Builder
    public static class BookingTimelineResponse {
        private Date bookingTime;
        private String checkInUrl;
        private Date checkInTime;
        private String checkOutUrl;
        private Date checkOutTime;
        private Date paymentTime;
        private Date inProgressTime;
        private Date cancelTime;
        private Date noShowTime;
        private String failTime;
    }
}

