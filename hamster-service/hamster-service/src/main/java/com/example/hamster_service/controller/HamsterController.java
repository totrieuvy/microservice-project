package com.example.hamster_service.controller;

import com.example.hamster_service.config.ApiResponse;
import com.example.hamster_service.dto.request.CreateHamsterRequest;
import com.example.hamster_service.dto.response.CreateHamsterResponse;
import com.example.hamster_service.entity.Hamster;
import com.example.hamster_service.service.impl.HamsterServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hamsters")
@RequiredArgsConstructor
public class HamsterController {

    private final HamsterServiceImpl hamsterService;

    @PostMapping
    public ApiResponse<CreateHamsterResponse> createHamster(
            @Valid @RequestBody CreateHamsterRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        return hamsterService.createHamster(request, authHeader);
    }

    @GetMapping
    public ApiResponse<List<Hamster>> getMyHamsters(
            @RequestHeader("Authorization") String authHeader
    ) {
        return hamsterService.getAllHamsters(authHeader);
    }
}
