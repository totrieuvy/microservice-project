package com.example.user_service.controller;

import com.example.user_service.config.ApiResponse;
import com.example.user_service.dto.request.LoginRequest;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.request.VerifyOtpRequest;
import com.example.user_service.dto.response.LoginResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.entity.User;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.impl.TokenServiceImpl;
import com.example.user_service.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserServiceImpl userService;
    private final TokenServiceImpl tokenService;
    private final UserRepository userRepository;

    @PostMapping("/generate-activation-token")
    public ApiResponse<String> generateActivationToken(@RequestBody Map<String, Long> req) {
        Long userId = req.get("userId");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = tokenService.generateActivationToken(user);

        return ApiResponse.success("OK", token);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest);
    }

    @PostMapping("/verify-otp")
    public ApiResponse<String> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return userService.verifyOtp(request.getToken(), request.getOtp());
    }


    @GetMapping("/current-user")
    public ApiResponse<User> getCurrentUser(
            @RequestHeader("Authorization") String authHeader
    ) {
        return userService.getCurrentUser(authHeader);
    }


}
