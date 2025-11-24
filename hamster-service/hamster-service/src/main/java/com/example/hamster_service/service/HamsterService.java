package com.example.hamster_service.service;

import com.example.hamster_service.config.ApiResponse;
import com.example.hamster_service.dto.request.CreateHamsterRequest;
import com.example.hamster_service.dto.response.CreateHamsterResponse;
import com.example.hamster_service.dto.response.ListHamster;
import com.example.hamster_service.entity.Hamster;

import java.util.List;

public interface HamsterService {
    ApiResponse<CreateHamsterResponse> createHamster(CreateHamsterRequest createHamsterRequest, String token);

    ApiResponse<List<Hamster>> getAllHamsters(String token);
}
