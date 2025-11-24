package com.example.user_service.service;

import com.example.user_service.config.ApiResponse;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.ProfileResponse;
import com.example.user_service.dto.response.RegisterResponse;
import org.springframework.http.ResponseEntity;

public interface UserService {
    ResponseEntity<ApiResponse<RegisterResponse>> register(RegisterRequest registerRequest);

    ApiResponse<ProfileResponse> getUserProfile(String token);
}
