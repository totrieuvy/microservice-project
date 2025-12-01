package com.example.user_service.service.impl;

import com.example.user_service.config.ApiResponse;
import com.example.user_service.config.PasswordEncoderConfig;
import com.example.user_service.dto.request.RegisterRequest;
import com.example.user_service.dto.response.ProfileResponse;
import com.example.user_service.dto.response.RegisterResponse;
import com.example.user_service.entity.User;
import com.example.user_service.exception.EmailAlreadyExistsException;
import com.example.user_service.repository.UserRepository;
import com.example.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoderConfig passwordEncoderConfig;
    private final RestTemplate restTemplate;

    @Override
    public ResponseEntity<ApiResponse<RegisterResponse>> register(RegisterRequest registerRequest) {

        if (userRepository.findUserByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .status(400)
                    .body(ApiResponse.error(400, "Email is already in use!"));
        }

        String encodedPassword = passwordEncoderConfig.passwordEncoder()
                .encode(registerRequest.getPassword());

        User user = new User();
        user.setName(registerRequest.getName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(encodedPassword);
        user.setIsActive(false);

        User savedUser = userRepository.save(user);

        String tokenUrl = "http://auth-service/api/auth/generate-activation-token";

        Map<String, Long> tokenRequest = new HashMap<>();
        tokenRequest.put("userId", savedUser.getId());

        ApiResponse tokenResponse = restTemplate.postForObject(
                tokenUrl,
                tokenRequest,
                ApiResponse.class
        );

        String activationToken = tokenResponse.getData().toString();

        Map<String, Object> request = new HashMap<>();
        request.put("userId", savedUser.getId());
        request.put("email", savedUser.getEmail());
        request.put("name", savedUser.getName());
        request.put("activationToken", activationToken);

        restTemplate.postForObject(
                "http://notification-service/api/notification/send-otp",
                request,
                Void.class
        );


        RegisterResponse registerResponse = new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );

        return ResponseEntity
                .status(201)
                .body(ApiResponse.success("User registered successfully. Please check your email!", registerResponse));
    }


    @Override
    public ApiResponse<ProfileResponse> getUserProfile(String token) {
        String url = "http://auth-service/api/auth/current-user";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", token);

        HttpEntity<Void> entity = new HttpEntity<>(null, headers);

        ResponseEntity<ApiResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                ApiResponse.class
        );

        ApiResponse<?> apiResponse = response.getBody();
        if (apiResponse == null || apiResponse.getData() == null) {
            return ApiResponse.error(401, "Unauthorized");
        }

        Map<?, ?> userData = (Map<?, ?>) apiResponse.getData();
        Long userId = Long.valueOf(userData.get("id").toString());

        ProfileResponse profileResponse = new ProfileResponse();
        profileResponse.setId(userId);
        profileResponse.setName(userData.get("name").toString());
        profileResponse.setEmail(userData.get("email").toString());
        profileResponse.setRoleEnum(userData.get("role").toString());
        profileResponse.setIsActive(Boolean.valueOf(userData.get("isActive").toString()));
        return ApiResponse.success("OK", profileResponse);

    }
}