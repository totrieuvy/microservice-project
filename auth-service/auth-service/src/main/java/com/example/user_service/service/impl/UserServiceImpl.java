package com.example.user_service.service.impl;

//import com.example.user_service.config.ApiResponse;
import com.example.common.ApiResponse;

import com.example.user_service.config.PasswordEncoderConfig;
import com.example.user_service.dto.request.LoginRequest;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.LoginResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.entity.User;
import com.example.user_service.enums.RoleEnum;
import com.example.user_service.exception.EmailAlreadyExistsException;
import com.example.user_service.exception.UserNotFoundException;
import com.example.user_service.exception.WrongCredentialsException;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoderConfig passwordEncoderConfig;
    private final TokenServiceImpl tokenService;
    private final RestTemplate restTemplate;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        User user = userRepository.findUserByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException());

        if (!user.getIsActive()) {
            throw new WrongCredentialsException("error.user_not_active");
        }

        boolean match = passwordEncoderConfig.passwordEncoder()
                .matches(loginRequest.getPassword(), user.getPassword());

        if (!match) {
            throw new WrongCredentialsException("error.wrong_credentials");
        }

        String token = tokenService.generateToken(user);

        return new LoginResponse(token);
    }

    @Override
    public ApiResponse<List<User>> getAllAccountsExceptCurrent(String authHeader) {

        if (!authHeader.startsWith("Bearer ")) {
            return ApiResponse.error(401, "Invalid token format");
        }

        String jwt = authHeader.substring(7);

        // Lấy ra user hiện tại từ token
        User currentUser = tokenService.getAccountByToken(jwt);

        if (currentUser == null) {
            return ApiResponse.error(404, "User not found");
        }

        Long currentUserId = currentUser.getId();

        // Lấy tất cả user
        List<User> allUsers = userRepository.findAll();

        // Loại user hiện tại
        List<User> filteredUsers = allUsers.stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .toList();

        return ApiResponse.success("OK", filteredUsers);
    }

    @Override
    public ApiResponse<List<User>> getAllStaffAccounts() {
        List<User> staffUsers = userRepository.findAllByRole(RoleEnum.STAFF);
        return ApiResponse.success("OK", staffUsers);
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