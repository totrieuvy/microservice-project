package com.example.booking_service.repository;

import com.example.booking_service.dto.response.BookingResponse;
import com.example.booking_service.entity.Booking;
import com.example.booking_service.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByUserId(String userId, Pageable pageable);
    Optional<Booking> findById(Long id);

    @Query("""
    SELECT b FROM Booking b
    WHERE b.status = :status
    AND b.expiredAt < :now
""")
    List<Booking> findExpired(
            @Param("status") BookingStatus status,
            @Param("now") Date now
    );

}
