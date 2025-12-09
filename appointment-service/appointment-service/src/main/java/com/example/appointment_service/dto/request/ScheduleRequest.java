package com.example.appointment_service.dto.request;

import lombok.Data;

@Data
public class ScheduleRequest {
    private String startDate; // yyyy-MM-dd
    private String endDate;   // yyyy-MM-dd
}