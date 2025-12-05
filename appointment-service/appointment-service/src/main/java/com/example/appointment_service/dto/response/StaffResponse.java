package com.example.appointment_service.dto.response;

import lombok.Data;

@Data
public class StaffResponse {
    private String name;
    private Boolean isBooked = false;
}
