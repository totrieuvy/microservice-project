package com.example.user_service.service.impl;

import com.example.user_service.config.ApiResponse;
import com.example.user_service.config.PasswordEncoderConfig;
import com.example.user_service.dto.request.LoginRequest;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.LoginResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.entity.User;
import com.example.user_service.exception.EmailAlreadyExistsException;
import com.example.user_service.exception.WrongCredentialsException;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoderConfig passwordEncoderConfig;
    private final TokenServiceImpl tokenService;
    private final RestTemplate restTemplate;

    @Override
    public ApiResponse<LoginResponse> login(LoginRequest loginRequest) {

        User user = userRepository.findUserByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new WrongCredentialsException("Email or password is incorrect!"));

        if (!user.getIsActive()) {
            throw new WrongCredentialsException("Tài khoản chưa kích hoạt.");
        }

        boolean match = passwordEncoderConfig.passwordEncoder()
                .matches(loginRequest.getPassword(), user.getPassword());

        if (!match) {
            throw new WrongCredentialsException("Email or password is incorrect!");
        }

        String token = tokenService.generateToken(user);

        LoginResponse loginResponse = new LoginResponse(token);

        return ApiResponse.success("Login successfully!", loginResponse);
    }

    @Override
    public ApiResponse<String> verifyOtp(String token, String otp) {

        String jwt = token;
        User user = tokenService.getAccountByToken(jwt);

        if (user == null) {
            return ApiResponse.error(400, "Token không hợp lệ hoặc đã hết hạn");
        }

        Long userId = user.getId();

        String url = "http://notification-service/api/notification/verify";

        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("otp", otp);

        Boolean verified = restTemplate.postForObject(url, body, Boolean.class);

        if (!Boolean.TRUE.equals(verified)) {
            return ApiResponse.error(400, "OTP không chính xác hoặc đã hết hạn");
        }

        user.setIsActive(true);
        userRepository.save(user);

        return ApiResponse.success("Xác thực OTP thành công!", null);
    }


    @Override
    public ApiResponse<User> getCurrentUser(String token) {

        if (!token.startsWith("Bearer ")) {
            return ApiResponse.error(401, "Invalid token format");
        }

        String jwt = token.substring(7);

        User user = tokenService.getAccountByToken(jwt);

        if (user == null) {
            return ApiResponse.error(404, "User not found");
        }

        return ApiResponse.success("OK", user);
    }


}
