package com.example.user_service.dto.request;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String token;
    private String otp;
}
