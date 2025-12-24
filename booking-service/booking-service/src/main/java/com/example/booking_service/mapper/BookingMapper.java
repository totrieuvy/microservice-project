package com.example.booking_service.mapper;

import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingMapper {

    public BookingResponse toResponse(
            Booking booking,
            BookingPayment payment,
            BookingTimeline timeline,
            String paymentUrl
    ) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalBasePrice(booking.getTotalBasePrice())
                .totalFinalPrice(booking.getTotalFinalPrice())
                .status(booking.getStatus())
                .paymentUrl(paymentUrl)
                .items(toItems(booking.getItems()))
                .payment(toPayment(payment))
                .timeline(toTimeline(timeline))
                .build();
    }

    // ==========================
    // ITEMS (HAMSTERS)
    // ==========================
    private List<BookingResponse.BookingItemResponse> toItems(List<BookingItem> items) {
        if (items == null) return List.of();

        return items.stream()
                .map(item ->
                        BookingResponse.BookingItemResponse.builder()
                                .hamsterId(item.getHamsterId())
                                .services(toServices(item.getServices()))
                                .build()
                )
                .toList();
    }

    // ==========================
    // SERVICES
    // ==========================
    private List<BookingResponse.ServiceResponse> toServices(List<BookingServiceItem> services) {
        if (services == null) return List.of();

        return services.stream()
                .map(s ->
                        BookingResponse.ServiceResponse.builder()
                                .serviceId(s.getServiceId())
                                .serviceName(s.getServiceName())
                                .servicePrice(s.getServicePrice())
                                .discount(s.getDiscount())
                                .build()
                )
                .toList();
    }

    // ==========================
    // PAYMENT
    // ==========================
    private BookingResponse.BookingPaymentResponse toPayment(BookingPayment p) {
        if (p == null) return null;

        return BookingResponse.BookingPaymentResponse.builder()
                .paymentMethod(
                        p.getPaymentMethod() == null
                                ? null
                                : p.getPaymentMethod().name()
                )
                .responseCode(p.getResponseCode())
                .build();
    }

    // ==========================
    // TIMELINE
    // ==========================
    private BookingResponse.BookingTimelineResponse toTimeline(BookingTimeline t) {
        if (t == null) return null;

        return BookingResponse.BookingTimelineResponse.builder()
                .bookingTime(t.getBookingTime())
                .checkInUrl(t.getCheckInUrl())
                .checkInTime(t.getCheckInTime())
                .checkOutUrl(t.getCheckOutUrl())
                .checkOutTime(t.getCheckOutTime())
                .paymentTime(t.getPaymentTime())
                .inProgressTime(t.getInProgressTime())
                .cancelTime(t.getCancelTime())
                .noShowTime(t.getNoShowTime())
                .build();
    }
}
