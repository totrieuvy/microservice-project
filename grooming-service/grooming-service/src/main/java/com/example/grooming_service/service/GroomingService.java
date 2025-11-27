package com.example.grooming_service.service;

import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;

import java.util.List;

public interface GroomingService {
    CreateSingleGroomingResponse createSingleService(CreateSingleGroomingRequest createGroomingRequest);

    List<CreateSingleGroomingResponse> getAllSingleServices();

    CreateComboGroomingResponse createComboService(CreateSingleGroomingRequest createGroomingRequest);

    List<CreateComboGroomingResponse> getAllComboServices();
}
