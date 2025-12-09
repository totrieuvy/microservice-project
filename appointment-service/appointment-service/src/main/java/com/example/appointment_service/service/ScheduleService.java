package com.example.appointment_service.service;

import com.example.appointment_service.dto.response.DailyScheduleResponse;

import java.util.List;

public interface ScheduleService {
    List<DailyScheduleResponse> generateSchedule(String startDate, String endDate);
    List<DailyScheduleResponse> getSchedule(String startDate, String endDate);
}

