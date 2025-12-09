package com.example.booking_service.service;

import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.BookingFullResponse;
import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.dto.response.PaginationResponse;


public interface BookingService {
    BookingResponse createBooking(String authHeader, BookingRequest request);

    void updatePaymentStatus(PaymentCallbackRequest request);

    PaginationResponse<BookingFullResponse> getMyBookings(String authHeader, int page, int size);

    PaginationResponse<BookingFullResponse> getAllBookings(int page, int size);
}
