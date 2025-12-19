package com.example.appointment_service.repository;

import com.example.appointment_service.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    @Modifying
    @Query("""
        UPDATE TimeSlot t
        SET t.availableSlots = t.availableSlots - 1
        WHERE t.id = :id AND t.availableSlots > 0
    """)
    int reserveSlot(@Param("id") Long id);

    @Modifying
    @Query("""
        UPDATE TimeSlot t
        SET t.availableSlots = t.availableSlots + 1
        WHERE t.id = :id
    """)
    int releaseSlot(@Param("id") Long id);
}
