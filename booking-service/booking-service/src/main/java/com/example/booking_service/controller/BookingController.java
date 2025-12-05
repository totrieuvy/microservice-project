package com.example.booking_service.controller;

import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingResponse createBooking(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody BookingRequest request
    ) {
        return bookingService.createBooking(authHeader, request);
    }

    /** API nhận callback từ payment-service */
    @PostMapping("/payment-callback")
    public void handlePaymentCallback(@RequestBody PaymentCallbackRequest request) {
        bookingService.updatePaymentStatus(request);
    }
}
