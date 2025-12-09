package com.example.appointment_service.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
public class TimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String startTime;
    private String endTime;

    private int maxSlots;
    private int availableSlots;

    @ManyToOne
    @JoinColumn(name = "schedule_day_id")
    private ScheduleDay scheduleDay;
}
