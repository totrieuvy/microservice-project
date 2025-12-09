package com.example.booking_service.service.impl;

import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.*;
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
import com.example.booking_service.service.FcmV1Service;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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
    private final FcmV1Service fcmV1Service;

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
        String userId = userData.get("email").toString();


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

        //giảm available slot
        String bookUrl = "http://appointment-service/api/schedules/slots/" + request.getSlotId() + "/book";
        restTemplate.put(bookUrl, null);

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

            // ======== PUSH FCM ========
            String token = "e4e-7fjHgS7V_fCPPjBwrU:APA91bEOI91SKuQct59KVKrE-6q8Avsjs6NfyNQWeQ0Tx-V9umkWLRmUjg6OrjOOxVQ9bcmY0N1SQatjj2HrE0eWo95t1bcin0_WgxMGankWRFtI3QHuAQc";

            String title = "Khách đặt lịch thành công";

            String body = "Khách hàng đã đặt lịch thành công vào ngày "
                    + booking.getBookingDate()
                    + " từ " + booking.getStartTime()
                    + " đến " + booking.getEndTime()
                    + ". Tổng tiền: " + booking.getTotalFinalPrice() + " VNĐ";

            String img = "";

            fcmV1Service.sendNotification(token, title, body, img);
            } else {
            booking.setStatus(BookingStatus.FAILED);
        }

        bookingRepository.save(booking);
    }

    private BookingFullResponse mapToFullResponse(Booking booking) {

        BookingFullResponse res = new BookingFullResponse();

        res.setId(booking.getId());
        res.setUserId(booking.getUserId());
        res.setHamsterId(booking.getHamsterId());
        res.setBookingDate(booking.getBookingDate());
        res.setStartTime(booking.getStartTime());
        res.setEndTime(booking.getEndTime());
        res.setTotalBasePrice(booking.getTotalBasePrice());
        res.setTotalFinalPrice(booking.getTotalFinalPrice());
        res.setStatus(booking.getStatus().toString());

        // ---- DETAIL ----
        List<BookingDetail> details = bookingDetailRepository.findByBookingId(booking.getId());
        res.setDetails(details.stream().map(d -> {
            BookingDetailResponse r = new BookingDetailResponse();
            r.setServiceId(d.getServiceId());
            r.setServiceName(d.getServiceName());
            r.setServicePrice(d.getServicePrice());
            r.setDiscount(d.getDiscount());
            return r;
        }).toList());

        // ---- PAYMENT ----
        BookingPayment payment = bookingPaymentRepository.findByBookingId(booking.getId());
        if (payment != null) {
            BookingPaymentResponse p = new BookingPaymentResponse();
            p.setPaymentMethod(payment.getPaymentMethod() == null ? null : payment.getPaymentMethod().toString());
            p.setResponseCode(payment.getResponseCode());
            res.setPayment(p);
        }

        // ---- TIMELINE ----
        BookingTimeline timeline = bookingTimelineRepository.findByBookingId(booking.getId());
        if (timeline != null) {
            BookingTimelineResponse t = new BookingTimelineResponse();
            t.setPaymentTime(timeline.getPaymentTime());
            t.setCompletedTime(timeline.getCheckOutTime());
            res.setTimeline(t);
        }

        return res;
    }

    @Override
    public PaginationResponse<BookingFullResponse> getMyBookings(String authHeader, int page, int size) {

        // Lấy current user từ auth-service
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "http://auth-service/api/auth/current-user",
                HttpMethod.GET,
                entity,
                Map.class
        );

        String userEmail = ((Map<String, Object>) response.getBody().get("data")).get("email").toString();

        Pageable pageable = PageRequest.of(page, size);

        Page<Booking> bookings = bookingRepository.findByUserId(userEmail, pageable);

        PaginationResponse<BookingFullResponse> res = new PaginationResponse<>();
        res.setContent(
                bookings.getContent().stream().map(this::mapToFullResponse).toList()
        );
        res.setPage(bookings.getNumber());
        res.setTotalPages(bookings.getTotalPages());
        res.setTotalElements(bookings.getTotalElements());

        return res;
    }


    @Override
    public PaginationResponse<BookingFullResponse> getAllBookings(int page, int size) {

        Pageable pageable = PageRequest.of(page, size);

        Page<Booking> bookings = bookingRepository.findAll(pageable);

        PaginationResponse<BookingFullResponse> res = new PaginationResponse<>();
        res.setContent(
                bookings.getContent().stream().map(this::mapToFullResponse).toList()
        );
        res.setPage(bookings.getNumber());
        res.setTotalPages(bookings.getTotalPages());
        res.setTotalElements(bookings.getTotalElements());

        return res;
    }

    private void sendFcmNotification(String token, String title, String body, String imageBase64) {

        try {
            String firebaseUrl = "https://fcm.googleapis.com/fcm/send";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "key=BOYKZ4MFMfEBL8WJTLid1bmd-m0Hbq8Aru3jlJTbylPWiHpdxyiKlhU97BtPw3K44Uyn4BLqzzVmsptNvwatdRI\t"); // ← nhớ đổi server key !!!

            Map<String, Object> message = new HashMap<>();
            message.put("to", token);

            Map<String, Object> notification = new HashMap<>();
            notification.put("title", title);
            notification.put("body", body);
            notification.put("image", imageBase64);

            message.put("notification", notification);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(message, headers);

            restTemplate.postForObject(firebaseUrl, entity, String.class);

        } catch (Exception e) {
            System.out.println("🔥 Error sending FCM: " + e.getMessage());
        }
    }

}
