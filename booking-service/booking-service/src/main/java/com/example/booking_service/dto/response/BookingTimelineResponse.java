package com.example.booking_service.dto.response;

import lombok.Data;

import java.util.Date;

@Data
public class BookingTimelineResponse {
    private Date paymentTime;
    private Date completedTime;
}

