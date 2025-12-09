package com.example.appointment_service.dto.response;

import lombok.Data;

@Data
public class StaffSlotResponse {
    private Long staffId;
    private boolean booked;
}
