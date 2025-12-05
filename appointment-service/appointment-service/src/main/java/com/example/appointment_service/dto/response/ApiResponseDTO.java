package com.example.appointment_service.dto.response;

import lombok.Data;

@Data
public class ApiResponseDTO<T> {
    private int code;
    private String message;
    private T data;
}
