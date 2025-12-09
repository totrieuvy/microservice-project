package com.example.appointment_service.service.impl;

import com.example.appointment_service.dto.response.*;
import com.example.appointment_service.entity.ScheduleDay;
//import com.example.appointment_service.entity.StaffSlot;
import com.example.appointment_service.entity.TimeSlot;
import com.example.appointment_service.repository.ScheduleDayRepository;
import com.example.appointment_service.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final RestTemplate restTemplate;
    private final ScheduleDayRepository scheduleDayRepository;

    @Override
    public List<DailyScheduleResponse> generateSchedule(String startDate, String endDate) {

        // call auth-service để lấy số staff
        List<UserDTO> staffs = restTemplate.exchange(
                "http://auth-service/api/auth/staff-accounts",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponseDTO<List<UserDTO>>>() {}
        ).getBody().getData();

        int staffCount = staffs.size();

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        String[][] TIME_SLOTS = {
                {"09:00", "10:00"},
                {"10:00", "11:00"},
                {"11:00", "12:00"},
                {"13:00", "14:00"},
                {"14:00", "15:00"},
                {"15:00", "16:00"},
                {"16:00", "17:00"},
                {"17:00", "18:00"}
        };

        List<DailyScheduleResponse> result = new ArrayList<>();

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            if (scheduleDayRepository.existsByDate(date))
                continue;

            ScheduleDay day = new ScheduleDay();
            day.setDate(date);

            List<TimeSlot> slots = new ArrayList<>();

            for (String[] ts : TIME_SLOTS) {

                TimeSlot slot = new TimeSlot();
                slot.setStartTime(ts[0]);
                slot.setEndTime(ts[1]);
                slot.setMaxSlots(staffCount);
                slot.setAvailableSlots(staffCount);
                slot.setScheduleDay(day);

                slots.add(slot);
            }

            day.setTimeSlots(slots);

            scheduleDayRepository.save(day);

            result.add(convertToResponse(day));
        }

        return result;
    }

    @Override
    public List<DailyScheduleResponse> getSchedule(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        List<ScheduleDay> days = scheduleDayRepository
                .findByDateBetweenOrderByDateAsc(start, end);

        List<DailyScheduleResponse> result = new ArrayList<>();

        for (ScheduleDay day : days) {
            result.add(convertToResponse(day));
        }

        return result;
    }

    private DailyScheduleResponse convertToResponse(ScheduleDay day) {
        DailyScheduleResponse res = new DailyScheduleResponse();
        res.setDate(day.getDate().toString());

        List<TimeSlotResponse> list = new ArrayList<>();

        for (TimeSlot slot : day.getTimeSlots()) {
            TimeSlotResponse ts = new TimeSlotResponse();
            ts.setId(slot.getId());
            ts.setStartTime(slot.getStartTime());
            ts.setEndTime(slot.getEndTime());
            ts.setMaxSlots(slot.getMaxSlots());
            ts.setAvailableSlots(slot.getAvailableSlots());

            list.add(ts);
        }

        res.setSlots(list);
        return res;
    }
}
