package com.example.booking_service.mapper;

import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.entity.BookingDetail;
import com.example.booking_service.entity.BookingPayment;
import com.example.booking_service.entity.BookingTimeline;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingMapper {

    public BookingResponse toResponse(
            Booking booking,
            List<BookingDetail> details,
            BookingPayment payment,
            BookingTimeline timeline,
            String paymentUrl
    ) {
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUserId())
                .hamsterId(booking.getHamsterId())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .totalBasePrice(booking.getTotalBasePrice())
                .totalFinalPrice(booking.getTotalFinalPrice())
                .status(booking.getStatus())
                .paymentUrl(paymentUrl)
                .details(details.stream().map(this::toDetail).toList())
                .payment(toPayment(payment))
                .timeline(toTimeline(timeline))
                .build();
    }

    private BookingResponse.BookingDetailResponse toDetail(BookingDetail d) {
        return BookingResponse.BookingDetailResponse.builder()
                .serviceId(d.getServiceId())
                .serviceName(d.getServiceName())
                .servicePrice(d.getServicePrice())
                .discount(d.getDiscount())
                .build();
    }

    private BookingResponse.BookingPaymentResponse toPayment(BookingPayment p) {
        if (p == null) return null;
        return BookingResponse.BookingPaymentResponse.builder()
                .paymentMethod(p.getPaymentMethod() == null ? null : p.getPaymentMethod().name())
                .responseCode(p.getResponseCode())
                .build();
    }

    private BookingResponse.BookingTimelineResponse toTimeline(BookingTimeline t) {
        if (t == null) return null;
        return BookingResponse.BookingTimelineResponse.builder()
                .bookingTime(t.getBookingTime())
                .paymentTime(t.getPaymentTime())
                .checkInTime(t.getCheckInTime())
                .checkOutTime(t.getCheckOutTime())
                .build();
    }
}

