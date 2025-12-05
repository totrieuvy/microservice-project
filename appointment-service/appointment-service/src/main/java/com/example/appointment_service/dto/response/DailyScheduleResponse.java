package com.example.appointment_service.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class DailyScheduleResponse {
    private String date;
    private List<TimeSlotResponse> slots;
}
