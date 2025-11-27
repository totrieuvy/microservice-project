package com.example.grooming_service.service.impl;

import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;
import com.example.grooming_service.entity.Services;
import com.example.grooming_service.enums.GroomingEnum;
import com.example.grooming_service.repository.GroomingDetailRepository;
import com.example.grooming_service.repository.GroomingRepository;
import com.example.grooming_service.service.GroomingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroomingServiceImpl implements GroomingService {

    private final GroomingRepository groomingRepository;
    private final GroomingDetailRepository groomingDetailRepository;
    private final RestTemplate restTemplate;

    @Override
    public CreateSingleGroomingResponse createSingleService(CreateSingleGroomingRequest createGroomingRequest) {
        Services service = new Services();
        service.setServiceName(createGroomingRequest.getServiceName());
        service.setType(GroomingEnum.SINGLE);
        service.setBasePrice(createGroomingRequest.getBasePrice());
        service.setDiscount(0);
        service.setFinalPrice(createGroomingRequest.getBasePrice());
        service.setDescription(createGroomingRequest.getDescription());
        service.setImageUrl(createGroomingRequest.getImageUrl());
        service.setStartDate(createGroomingRequest.getStartDate());
        service.setEndDate(createGroomingRequest.getEndDate());

        groomingRepository.save(service);

        CreateSingleGroomingResponse response = new CreateSingleGroomingResponse();
        response.setId(service.getId());
        response.setType(service.getType());
        response.setServiceName(service.getServiceName());
        response.setBasePrice(service.getBasePrice());
        response.setFinalPrice(service.getFinalPrice());
        response.setDescription(service.getDescription());
        response.setImageUrl(service.getImageUrl());
        response.setStartDate(service.getStartDate());
        response.setEndDate(service.getEndDate());

        return response;

    }

    @Override
    public List<CreateSingleGroomingResponse> getAllSingleServices() {

        List<Services> services = groomingRepository.getAllSingleServices(GroomingEnum.SINGLE);

        return services.stream().map(service -> {
            CreateSingleGroomingResponse response = new CreateSingleGroomingResponse();
            response.setId(service.getId());
            response.setServiceName(service.getServiceName());
            response.setType(service.getType());
            response.setBasePrice(service.getBasePrice());
            response.setDiscount(service.getDiscount());
            response.setFinalPrice(service.getFinalPrice());
            response.setDescription(service.getDescription());
            response.setImageUrl(service.getImageUrl());
            response.setStartDate(service.getStartDate());
            response.setEndDate(service.getEndDate());
            response.setIsActive(service.getIsActive());
            return response;
        }).toList();
    }


    @Override
    public CreateComboGroomingResponse createComboService(CreateSingleGroomingRequest createGroomingRequest) {
        return null;
    }

    @Override
    public List<CreateComboGroomingResponse> getAllComboServices() {
        return List.of();
    }
}
