package com.example.appointment_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class TimeSlotResponse {
    private Long id;
    private String startTime;
    private String endTime;
    private int maxSlots;
    private int availableSlots;
}

