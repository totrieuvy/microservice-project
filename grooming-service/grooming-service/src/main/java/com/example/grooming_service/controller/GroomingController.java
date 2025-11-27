package com.example.grooming_service.controller;

import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;
import com.example.grooming_service.service.impl.GroomingServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.example.common.ApiResponse;

import java.util.List;


@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class GroomingController {

    private final GroomingServiceImpl groomingService;

    @PostMapping
    public ApiResponse<CreateSingleGroomingResponse> createSingleService(@Valid @RequestBody CreateSingleGroomingRequest createSingleGroomingRequest) {
        CreateSingleGroomingResponse response = groomingService.createSingleService(createSingleGroomingRequest);
        return ApiResponse.success("Single grooming service created successfully", response);
    }

    @GetMapping
    public ApiResponse<List<CreateSingleGroomingResponse>> getAllSingleServices() {
        List<CreateSingleGroomingResponse> list = groomingService.getAllSingleServices();
        return ApiResponse.success("List of single grooming services", list);
    }


    @PostMapping("/combos")
    public ApiResponse<CreateComboGroomingResponse> createComboService() {
        return null;
    }

    @GetMapping("/combos")
    public ApiResponse<List<CreateComboGroomingResponse>> getAllComboServices() {
        return null;
    }
}
