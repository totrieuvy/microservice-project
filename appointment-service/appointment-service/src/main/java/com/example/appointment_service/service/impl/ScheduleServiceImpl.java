package com.example.appointment_service.service.impl;

import com.example.appointment_service.dto.response.ApiResponseDTO;
import com.example.appointment_service.dto.response.DailyScheduleResponse;
import com.example.appointment_service.dto.response.StaffResponse;
import com.example.appointment_service.dto.response.TimeSlotResponse;
import com.example.appointment_service.dto.response.UserDTO;
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

    @Override
    public List<DailyScheduleResponse> generateSchedule(String startDate, String endDate) {

        ResponseEntity<ApiResponseDTO<List<UserDTO>>> response =
                restTemplate.exchange(
                        "http://auth-service/api/auth/staff-accounts",
                        HttpMethod.GET,
                        null,
                        new ParameterizedTypeReference<ApiResponseDTO<List<UserDTO>>>() {}
                );

        List<UserDTO> users = response.getBody().getData();

        List<StaffResponse> staffs = users.stream()
                .map(u -> {
                    StaffResponse s = new StaffResponse();
                    s.setName(u.getName());
                    return s;
                })
                .toList();

        int maxSlots = staffs.size();

        // Time slots cố định
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

        // Generate schedule for date range
        List<DailyScheduleResponse> result = new ArrayList<>();

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {

            List<TimeSlotResponse> slots = new ArrayList<>();

            for (String[] time : TIME_SLOTS) {

                TimeSlotResponse slot = new TimeSlotResponse();
                slot.setStartTime(time[0]);
                slot.setEndTime(time[1]);
                slot.setMaxSlots(maxSlots);
                slot.setAvailableSlot(maxSlots);
                slot.setStaffs(staffs);

                slots.add(slot);
            }

            DailyScheduleResponse daily = new DailyScheduleResponse();
            daily.setDate(date.toString());
            daily.setSlots(slots);

            result.add(daily);
        }

        return result;
    }
}
