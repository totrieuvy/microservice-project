package com.example.appointment_service.controller;

import com.example.appointment_service.dto.request.ScheduleRequest;
import com.example.appointment_service.dto.response.DailyScheduleResponse;
import com.example.appointment_service.entity.TimeSlot;
import com.example.appointment_service.repository.TimeSlotRepository;
import com.example.appointment_service.service.impl.ScheduleServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleServiceImpl scheduleService;
    private final TimeSlotRepository timeSlotRepository;

    @PostMapping("/generate")
    public List<DailyScheduleResponse> generate(@RequestBody ScheduleRequest request) {
        return scheduleService.generateSchedule(request.getStartDate(), request.getEndDate());
    }

    @GetMapping
    public List<DailyScheduleResponse> getSchedule(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return scheduleService.getSchedule(startDate, endDate);
    }

    @PutMapping("/slots/{id}/book")
    public void bookSlot(@PathVariable Long id) {
        TimeSlot slot = timeSlotRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getAvailableSlots() <= 0) {
            throw new RuntimeException("Slot is full");
        }

        slot.setAvailableSlots(slot.getAvailableSlots() - 1);
        timeSlotRepository.save(slot);
    }


}

