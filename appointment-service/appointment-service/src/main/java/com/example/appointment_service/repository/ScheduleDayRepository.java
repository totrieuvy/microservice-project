package com.example.appointment_service.repository;

import com.example.appointment_service.entity.ScheduleDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleDayRepository extends JpaRepository<ScheduleDay, Long> {
    boolean existsByDate(LocalDate date);
    ScheduleDay findByDate(LocalDate date);
    List<ScheduleDay> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);

}
