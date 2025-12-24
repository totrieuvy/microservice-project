package com.example.booking_service.controller;

import com.example.booking_service.dto.request.BookingCheckRequest;
import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.BookingFullResponse;
import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.dto.response.PaginationResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.service.BookingService;
import com.example.booking_service.service.impl.BookingServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingServiceImpl bookingService;

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

    @GetMapping("/my")
    public PaginationResponse<BookingFullResponse> getMyBookings(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return bookingService.getMyBookings(authHeader, page, size);
    }

    // 2️⃣ API: Get all bookings (admin)
    @GetMapping("/all")
    public PaginationResponse<BookingFullResponse> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return bookingService.getAllBookings(page, size);
    }

    @GetMapping("/{id}")
    public BookingFullResponse getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    @PutMapping("/{id}/status")
    public BookingFullResponse updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return bookingService.updateStatus(id, status);
    }

    @PutMapping("/{id}/check-in")
    public BookingFullResponse checkIn(
            @PathVariable Long id,
            @RequestBody BookingCheckRequest request
    ) {
        return bookingService.checkIn(id, request);
    }

    @PutMapping("/{id}/check-out")
    public BookingFullResponse checkOut(
            @PathVariable Long id,
            @RequestBody BookingCheckRequest request
    ) {
        return bookingService.checkOut(id, request);
    }

}
