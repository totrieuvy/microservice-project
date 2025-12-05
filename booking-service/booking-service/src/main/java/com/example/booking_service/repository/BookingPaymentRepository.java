package com.example.booking_service.repository;

import com.example.booking_service.entity.BookingPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingPaymentRepository extends JpaRepository<BookingPayment, Long> {
    BookingPayment findByBookingId(Long bookingId);
}
