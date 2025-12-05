package com.example.appointment_service.controller;

import com.example.appointment_service.dto.request.ScheduleRequest;
import com.example.appointment_service.dto.response.DailyScheduleResponse;
import com.example.appointment_service.service.impl.ScheduleServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleServiceImpl scheduleService;

    @PostMapping("/generate")
    public List<DailyScheduleResponse> generate(@RequestBody ScheduleRequest request) {
        return scheduleService.generateSchedule(
                request.getStartDate(),
                request.getEndDate()
        );
    }
}

