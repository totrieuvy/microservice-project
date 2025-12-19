package com.example.booking_service.service.impl;

import com.example.booking_service.config.AppointmentClient;
import com.example.booking_service.config.AuthClient;
import com.example.booking_service.config.PaymentClient;
import com.example.booking_service.dto.request.BookingCheckRequest;
import com.example.booking_service.dto.request.BookingRequest;
import com.example.booking_service.dto.request.PaymentCallbackRequest;
import com.example.booking_service.dto.response.*;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.entity.BookingDetail;
import com.example.booking_service.entity.BookingPayment;
import com.example.booking_service.entity.BookingTimeline;
import com.example.booking_service.entity.enums.BookingStatus;
import com.example.booking_service.exception.SlotLockedException;
import com.example.booking_service.mapper.BookingMapper;
import com.example.booking_service.repository.BookingDetailRepository;
import com.example.booking_service.repository.BookingPaymentRepository;
import com.example.booking_service.repository.BookingRepository;
import com.example.booking_service.repository.BookingTimelineRepository;
import com.example.booking_service.service.BookingService;
import com.example.booking_service.service.FcmV1Service;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.redisson.api.RedissonClient;
import org.redisson.api.RLock;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final BookingPaymentRepository bookingPaymentRepository;
    private final BookingTimelineRepository bookingTimelineRepository;
    private final RestTemplate restTemplate;
    private final FcmV1Service fcmV1Service;
    private final AuthClient authClient;
    private final AppointmentClient appointmentClient;
    private final PaymentClient paymentClient;
    private final BookingMapper bookingMapper;
    private final RedissonClient redissonClient;

    @Override
    @Transactional
    public BookingResponse createBooking(String authHeader, BookingRequest request) {

        System.out.println("Time clicked: " + new Date());

        String lockKey = "lock:slot:" + request.getSlotId();
        RLock lock = redissonClient.getLock(lockKey);

        boolean locked = false;

        try {
            // ⏱ try lock tối đa 3s, auto unlock sau 10s
            locked = lock.tryLock(3, 10, TimeUnit.SECONDS);

            if (!locked) {
                throw new SlotLockedException("Slot is being booked by another user");
            }
            System.out.println("🔒 LOCKED at " + new Date());

            // ========= CRITICAL SECTION =========

            String userId = authClient.getCurrentUserEmail(authHeader);

            double totalBasePrice = request.getServices()
                    .stream()
                    .mapToDouble(s -> s.getServicePrice())
                    .sum();

            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setHamsterId(request.getHamsterId());
            booking.setBookingDate(request.getBookingDate());
            booking.setStaffId(request.getStaffId());
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
            booking.setSlotId(request.getSlotId());
            booking.setStatus(BookingStatus.PENDING);
            booking.setExpiredAt(Date.from(Instant.now().plus(5, ChronoUnit.MINUTES)));
            booking.setTotalBasePrice(totalBasePrice);
            booking.setTotalFinalPrice(totalBasePrice);

            // 🔥 Atomic DB bên appointment-service
            appointmentClient.reserveSlot(request.getSlotId());

            bookingRepository.save(booking);

            // Save detail
            List<BookingDetail> details = request.getServices().stream()
                    .map(s -> {
                        BookingDetail d = new BookingDetail();
                        d.setBookingId(booking.getId());
                        d.setServiceId(s.getServiceId());
                        d.setServiceName(s.getServiceName());
                        d.setServicePrice(s.getServicePrice());
                        d.setDiscount(s.getDiscount());
                        return d;
                    }).toList();

            bookingDetailRepository.saveAll(details);

            BookingPayment payment = new BookingPayment();
            payment.setBookingId(booking.getId());
            bookingPaymentRepository.save(payment);

            BookingTimeline timeline = new BookingTimeline();
            timeline.setBookingId(booking.getId());
            timeline.setBookingTime(new Date());
            bookingTimelineRepository.save(timeline);

            String paymentUrl = null;
            if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
                paymentUrl = paymentClient.createVnpayPayment(
                        booking.getId(),
                        booking.getTotalFinalPrice()
                );
            }

            return bookingMapper.toResponse(
                    booking,
                    details,
                    payment,
                    timeline,
                    paymentUrl
            );
        } catch (InterruptedException e) {
            throw new RuntimeException("Could not acquire slot lock", e);
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }


//    @Override
//    @Transactional
//    public BookingResponse createBooking(String authHeader, BookingRequest request) {
//
//        // 1️⃣ Lấy current user
//        String userId = authClient.getCurrentUserEmail(authHeader);
//
//        // 2️⃣ Tính tiền
//        double totalBasePrice = request.getServices()
//                .stream()
//                .mapToDouble(s -> s.getServicePrice())
//                .sum();
//        double totalFinalPrice = totalBasePrice;
//
//        // 3️⃣ Tạo Booking
//        Booking booking = new Booking();
//        booking.setUserId(userId);
//        booking.setHamsterId(request.getHamsterId());
//        booking.setBookingDate(request.getBookingDate());
//        booking.setStaffId(request.getStaffId());
//        booking.setStartTime(request.getStartTime());
//        booking.setEndTime(request.getEndTime());
//        booking.setSlotId(request.getSlotId());
//        booking.setStatus(BookingStatus.PENDING);
//        booking.setExpiredAt(
//                Date.from(Instant.now().plus(5, ChronoUnit.MINUTES))
//        );
//        booking.setTotalBasePrice(totalBasePrice);
//        booking.setTotalFinalPrice(totalFinalPrice);
//        booking.setDiscount(null);
//
//        bookingRepository.save(booking);
//
//        // 4️⃣ Reserve slot (appointment-service)
//        appointmentClient.reserveSlot(request.getSlotId());
//
//        // 5️⃣ Lưu BookingDetail
//        List<BookingDetail> details = request.getServices()
//                .stream()
//                .map(s -> {
//                    BookingDetail d = new BookingDetail();
//                    d.setBookingId(booking.getId());
//                    d.setServiceId(s.getServiceId());
//                    d.setServiceName(s.getServiceName());
//                    d.setServicePrice(s.getServicePrice());
//                    d.setDiscount(s.getDiscount());
//                    return d;
//                })
//                .toList();
//
//        bookingDetailRepository.saveAll(details);
//
//        // 6️⃣ Lưu BookingPayment
//        BookingPayment payment = new BookingPayment();
//        payment.setBookingId(booking.getId());
//        payment.setPaymentMethod(
//                request.getPaymentMethod() == null
//                        ? null
//                        : PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase())
//        );
//        payment.setResponseCode(null);
//
//        bookingPaymentRepository.save(payment);
//
//        // 7️⃣ Lưu BookingTimeline
//        BookingTimeline timeline = new BookingTimeline();
//        timeline.setBookingId(booking.getId());
//        timeline.setBookingTime(new Date());
//
//        bookingTimelineRepository.save(timeline);
//
//        // 8️⃣ Tạo link thanh toán
//        String paymentUrl = null;
//        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
//            paymentUrl = paymentClient.createVnpayPayment(
//                    booking.getId(),
//                    booking.getTotalFinalPrice()
//            );
//        }
//
//        // 9️⃣ Map → BookingResponse
//        return bookingMapper.toResponse(
//                booking,
//                details,
//                payment,
//                timeline,
//                paymentUrl
//        );
//    }


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
            String token = "epqtPpC1adD1m5rv0xNRpy:APA91bEK-eiggoOL1qbll2jw-kyv3a6QJEW60K6xPAVdtHwJTHSqIqap175JIlSkulPjRAZ_RfRMc8zN2uWi3x7o627hOUDZlr1ejmfIh-3-Nz8RShs5qNE";
            token = token.trim();
            System.out.println("TOKEN=[" + token + "]");
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

            // ===== HOÀN SLOT =====
            String releaseUrl =
                    "http://appointment-service/api/schedules/slots/"
                            + booking.getSlotId()
                            + "/release";

            restTemplate.put(releaseUrl, null);
        }

        bookingRepository.save(booking);
    }

    //chạy mỗi 1 phút
    //atomic database
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredBookings() {
        System.out.println("🔥 Scheduler running at " + new Date());

        List<Booking> expired =
                bookingRepository.findExpired(
                        BookingStatus.PENDING,
                        new Date()
                );

        System.out.println("🔥 Found expired: " + expired.size());

        for (Booking booking : expired) {

            booking.setStatus(BookingStatus.FAILED);

            restTemplate.put(
                    "http://appointment-service/api/schedules/slots/"
                            + booking.getSlotId()
                            + "/release",
                    null
            );

            bookingRepository.save(booking);
        }
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

    @Override
    public BookingResponse getBookingById(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        // ---- DETAIL ----
        List<BookingDetail> details = bookingDetailRepository.findByBookingId(id);

        List<BookingResponse.BookingDetailResponse> detailResponses =
                details.stream()
                        .map(d -> BookingResponse.BookingDetailResponse.builder()
                                .serviceId(d.getServiceId())
                                .serviceName(d.getServiceName())
                                .servicePrice(d.getServicePrice())
                                .discount(d.getDiscount())
                                .build())
                        .toList();

        // ---- PAYMENT ----
        BookingPayment payment = bookingPaymentRepository.findByBookingId(id);

        BookingResponse.BookingPaymentResponse paymentResponse = null;
        if (payment != null) {
            paymentResponse = BookingResponse.BookingPaymentResponse.builder()
                    .paymentMethod(payment.getPaymentMethod() == null ? null : payment.getPaymentMethod().toString())
                    .responseCode(payment.getResponseCode())
                    .build();
        }

        // ---- TIMELINE ----
        BookingTimeline timeline = bookingTimelineRepository.findByBookingId(id);

        BookingResponse.BookingTimelineResponse timelineResponse = null;
        if (timeline != null) {
            timelineResponse = BookingResponse.BookingTimelineResponse.builder()
                    .bookingTime(timeline.getBookingTime())
                    .checkInUrl(timeline.getCheckInUrl())
                    .checkInTime(timeline.getCheckInTime())
                    .checkOutUrl(timeline.getCheckOutUrl())
                    .checkOutTime(timeline.getCheckOutTime())
                    .paymentTime(timeline.getPaymentTime())
                    .inProgressTime(timeline.getInProgressTime())
                    .cancelTime(timeline.getCancelTime())
                    .noShowTime(timeline.getNoShowTime())
                    .failTime(timeline.getFailTime())
                    .build();
        }

        // ---- BUILD RESPONSE ----
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
                .details(detailResponses)
                .payment(paymentResponse)
                .timeline(timelineResponse)
                .paymentUrl(null) // nếu có URL thanh toán thì set here
                .build();
    }

    @Override
    public BookingResponse updateStatus(Long id, String status) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        BookingStatus newStatus = BookingStatus.valueOf(status.toUpperCase());
        booking.setStatus(newStatus);
        bookingRepository.save(booking);

        return getBookingById(id);
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

    @Override
    public BookingResponse checkIn(Long id, BookingCheckRequest req) {

        if (req.getImageUrl() == null || req.getImageUrl().isBlank()) {
            throw new RuntimeException("Check-in image is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PAID) {
            throw new RuntimeException("Only PAID booking can be checked-in");
        }

        BookingTimeline timeline = bookingTimelineRepository.findByBookingId(id);

        timeline.setCheckInUrl(req.getImageUrl());
        timeline.setCheckInTime(new Date());
        timeline.setInProgressTime(new Date());

        bookingTimelineRepository.save(timeline);

        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);

        return getBookingById(id);
    }

    @Override
    public BookingResponse checkOut(Long id, BookingCheckRequest req) {

        if (req.getImageUrl() == null || req.getImageUrl().isBlank()) {
            throw new RuntimeException("Check-out image is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new RuntimeException("Only IN_PROGRESS booking can be checked-out");
        }

        BookingTimeline timeline = bookingTimelineRepository.findByBookingId(id);

        timeline.setCheckOutUrl(req.getImageUrl());
        timeline.setCheckOutTime(new Date());

        bookingTimelineRepository.save(timeline);

        booking.setStatus(BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);

        return getBookingById(id);
    }


}
