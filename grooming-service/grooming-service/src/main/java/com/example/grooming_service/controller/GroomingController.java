package com.example.grooming_service.controller;

import com.cloudinary.Api;
import com.example.grooming_service.dto.CreateComboGroomingRequest;
import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;
import com.example.grooming_service.service.impl.GroomingServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;      // ✅ đúng
import org.springframework.data.domain.Pageable;import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/detail/{id}")
    public ApiResponse<CreateSingleGroomingResponse> getServiceDetailById(@PathVariable Long id) {
        CreateSingleGroomingResponse response = groomingService.getServiceById(id);
        return ApiResponse.success("Service details retrieved successfully", response);
    }

    @GetMapping("/active")
    public ApiResponse<Page<CreateSingleGroomingResponse>> getActiveServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size
    ) {
        return ApiResponse.success(
                "Active services",
                groomingService.getActiveServices(page, size)
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<CreateSingleGroomingResponse> getServiceById(@PathVariable Long id) {
        return ApiResponse.success(
                "Service details",
                groomingService.getServiceById(id)
        );
    }

    @PostMapping("/combos")
    public ApiResponse<CreateComboGroomingResponse> createCombo(
            @Valid @RequestBody CreateComboGroomingRequest req
    ) {
        return ApiResponse.success(
                "Combo created",
                groomingService.createComboService(req)
        );
    }

    @GetMapping("/combos")
    public ApiResponse<List<CreateComboGroomingResponse>> getAllCombos() {
        return ApiResponse.success(
                "All combos",
                groomingService.getAllComboServices()
        );
    }

}
