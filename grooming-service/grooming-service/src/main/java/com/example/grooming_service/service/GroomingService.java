package com.example.grooming_service.service;

import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;
import com.example.grooming_service.entity.Services;
import com.example.grooming_service.enums.GroomingEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface GroomingService {
    CreateSingleGroomingResponse createSingleService(CreateSingleGroomingRequest createGroomingRequest);

    List<CreateSingleGroomingResponse> getAllSingleServices();

    CreateSingleGroomingResponse getSingleServiceById(Long id);

    CreateComboGroomingResponse createComboService(CreateSingleGroomingRequest createGroomingRequest);

    List<CreateComboGroomingResponse> getAllComboServices();

    Page<CreateSingleGroomingResponse> getActiveServices(int page, int size);

    CreateSingleGroomingResponse getServiceById(Long id);
}
