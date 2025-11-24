package com.example.hamster_service.service.impl;

import com.example.hamster_service.config.ApiResponse;
import com.example.hamster_service.dto.request.CreateHamsterRequest;
import com.example.hamster_service.dto.response.CreateHamsterResponse;
import com.example.hamster_service.entity.Hamster;
import com.example.hamster_service.repository.HamsterRepository;
import com.example.hamster_service.service.CloudinaryService;
import com.example.hamster_service.service.HamsterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HamsterServiceImpl implements HamsterService {

    private final HamsterRepository hamsterRepository;
    private final CloudinaryService cloudinaryService;
    private final RestTemplate restTemplate;

    @Override
    public ApiResponse<CreateHamsterResponse> createHamster(
            CreateHamsterRequest request,
            String authHeader
    ) {
        // 1. Gọi auth-service để lấy current user
        String url = "http://auth-service/api/auth/current-user";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);

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

        // 2. Upload image to Cloudinary
        String imageUrl = cloudinaryService.uploadImage(request.getImageUrl());

        // 3. Tạo Hamster
        Hamster hamster = new Hamster();
        hamster.setUserId(userId);
        hamster.setName(request.getName());
        hamster.setBirthDate(request.getBirthDate());
        hamster.setColor(request.getColor());
        hamster.setGenderEnum(request.getGenderEnum());
        hamster.setImageUrl(imageUrl);

        hamsterRepository.save(hamster);

        CreateHamsterResponse hamsterResponse = new CreateHamsterResponse(
                hamster.getId(),
                hamster.getUserId(),
                hamster.getName(),
                hamster.getBirthDate(),
                hamster.getColor(),
                hamster.getGenderEnum(),
                hamster.getImageUrl()
        );

        return ApiResponse.success("Hamster created successfully", hamsterResponse);
    }

    @Override
    public ApiResponse<List<Hamster>> getAllHamsters(String authHeader) {

        String url = "http://auth-service/api/auth/current-user";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);

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

        List<Hamster> hamsters = hamsterRepository.findAllByUserId(userId);

        return ApiResponse.success("Fetched hamsters successfully", hamsters);
    }
}
