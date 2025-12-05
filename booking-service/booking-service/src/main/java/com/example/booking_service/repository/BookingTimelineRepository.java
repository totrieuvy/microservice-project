package com.example.booking_service.repository;

import com.example.booking_service.entity.BookingTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingTimelineRepository extends JpaRepository<BookingTimeline, Long> {
    BookingTimeline findByBookingId(Long bookingId);
}
