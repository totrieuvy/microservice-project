package com.example.user_service.controller;

import com.example.user_service.config.ApiResponse;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.ProfileResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest registerRequest) {
        return userService.register(registerRequest);
    }


    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> getProfile(
            @RequestHeader("Authorization") String authHeader
    ) {
        return userService.getUserProfile(authHeader);
    }

}