package com.example.booking_service.service.impl;

import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.entity.BookingDetail;
import com.example.booking_service.entity.BookingPayment;
import com.example.booking_service.entity.BookingTimeline;
import com.example.booking_service.entity.enums.BookingStatus;
import com.example.booking_service.entity.enums.PaymentMethod;
import com.example.booking_service.repository.BookingDetailRepository;
import com.example.booking_service.repository.BookingPaymentRepository;
import com.example.booking_service.repository.BookingRepository;
import com.example.booking_service.repository.BookingTimelineRepository;
import com.example.booking_service.service.BookingService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final BookingPaymentRepository bookingPaymentRepository;
    private final BookingTimelineRepository bookingTimelineRepository;
    private final RestTemplate restTemplate;

    @Override
    public BookingResponse createBooking(String authHeader, BookingRequest request) {

        // lấy user
        String url = "http://auth-service/api/auth/current-user";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("data") == null) {
            throw new RuntimeException("Cannot fetch current user");
        }

        Map<String, Object> userData = (Map<String, Object>) body.get("data");
        Long userId = Long.valueOf(userData.get("id").toString());


        // tổng tiền
        double totalBasePrice = request.getServices()
                .stream()
                .mapToDouble(s -> s.getServicePrice())
                .sum();

        double totalFinalPrice = totalBasePrice;

        // Lưu Booking
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setHamsterId(request.getHamsterId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStaffId(request.getStaffId());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalBasePrice(totalBasePrice);
        booking.setTotalFinalPrice(totalFinalPrice);
        booking.setDiscount(null);

        bookingRepository.save(booking);


        // Lưu BookingDetail
        List<BookingDetail> details = new ArrayList<>();

        request.getServices().forEach(s -> {
            BookingDetail d = new BookingDetail();
            d.setBookingId(booking.getId());
            d.setServiceId(s.getServiceId());
            d.setServiceName(s.getServiceName());
            d.setServicePrice(s.getServicePrice());
            d.setDiscount(s.getDiscount());
            details.add(d);
        });

        bookingDetailRepository.saveAll(details);


        // Lưu BookingPayment
        BookingPayment payment = new BookingPayment();
        payment.setBookingId(booking.getId());

        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(
                    PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())
            );
        } else {
            payment.setPaymentMethod(null);
        }

        payment.setResponseCode(null);
        bookingPaymentRepository.save(payment);


        // Lưu BookingTimeline
        BookingTimeline timeline = new BookingTimeline();
        timeline.setBookingId(booking.getId());
        bookingTimelineRepository.save(timeline);


        // payment-service tạo link thanh toán
        String paymentUrl = null;
        //VNPAY
        if (request.getPaymentMethod() != null
                && request.getPaymentMethod().equalsIgnoreCase("VNPAY")) {

            String payUrl = "http://payment-service/api/payments/create"
                    + "?bookingId=" + booking.getId()
                    + "&amount=" + booking.getTotalFinalPrice();

            paymentUrl = restTemplate.postForObject(payUrl, null, String.class);
        }


        // Trả kết quả BookingResponse
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
                .details(details.stream().map(d ->
                        BookingResponse.BookingDetailResponse.builder()
                                .serviceId(d.getServiceId())
                                .serviceName(d.getServiceName())
                                .servicePrice(d.getServicePrice())
                                .discount(d.getDiscount())
                                .build()
                ).toList())
                .build();
    }

    // CALLBACK
    @Override
    public void updatePaymentStatus(PaymentCallbackRequest req) {

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingPayment payment = bookingPaymentRepository.findByBookingId(req.getBookingId());
        payment.setResponseCode(req.getResponseCode());
        bookingPaymentRepository.save(payment);

        BookingTimeline timeline = bookingTimelineRepository.findByBookingId(req.getBookingId());
        timeline.setPaymentTime(new Date());
        bookingTimelineRepository.save(timeline);

        if ("00".equals(req.getResponseCode())) {
            booking.setStatus(BookingStatus.PAID);
        } else {
            booking.setStatus(BookingStatus.FAILED);
        }

        bookingRepository.save(booking);
    }
}
