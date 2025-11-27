package com.example.user_service.service;

import com.example.common.ApiResponse;

import com.example.user_service.dto.request.LoginRequest;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.LoginResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.entity.User;

public interface UserService {
    LoginResponse login(LoginRequest loginRequest);

    ApiResponse<String> verifyOtp(String token, String otp);

    ApiResponse<User> getCurrentUser(String authHeader);
}
