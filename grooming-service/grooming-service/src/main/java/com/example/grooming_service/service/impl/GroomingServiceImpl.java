package com.example.grooming_service.service.impl;

import com.example.grooming_service.dto.CreateComboGroomingRequest;
import com.example.grooming_service.dto.CreateSingleGroomingRequest;
import com.example.grooming_service.dto.CreateComboGroomingResponse;
import com.example.grooming_service.dto.CreateSingleGroomingResponse;
import com.example.grooming_service.entity.ServiceDetail;
import com.example.grooming_service.entity.Services;
import com.example.grooming_service.enums.GroomingEnum;
import com.example.grooming_service.repository.GroomingDetailRepository;
import com.example.grooming_service.repository.GroomingRepository;
import com.example.grooming_service.service.GroomingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.data.domain.Page;      // ✅ đúng
import org.springframework.data.domain.Pageable;
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
    public CreateSingleGroomingResponse getSingleServiceById(Long id) {
        Services service = groomingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        return mapToResponse(service);
    }

    private CreateSingleGroomingResponse mapToResponse(Services service) {
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
    }

    // === GET ACTIVE SERVICES WITH PAGINATION ===
    @Override
    public Page<CreateSingleGroomingResponse> getActiveServices(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Services> activePage =
                groomingRepository.findAllByTypeAndIsActiveTrue(GroomingEnum.SINGLE, pageable);

        return activePage.map(this::mapToResponse);
    }

    @Override
    public CreateSingleGroomingResponse getServiceById(Long id) {
        Services service = groomingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        return mapToResponse(service);
    }


    @Override
    public CreateComboGroomingResponse createComboService(CreateSingleGroomingRequest createGroomingRequest) {
        return null;
    }

    @Override
    public List<CreateComboGroomingResponse> getAllComboServices() {

        // 1. Lấy tất cả combo
        List<Services> combos =
                groomingRepository.getAllSingleServices(GroomingEnum.COMBO);

        return combos.stream().map(combo -> {

            // 2. Lấy danh sách child theo comboId
            List<ServiceDetail> details =
                    groomingDetailRepository.findByParentServiceId(combo.getId());

            List<Long> childIds = details.stream()
                    .map(ServiceDetail::getChildServiceId)
                    .toList();

            // 3. Lấy entity service của từng child
            List<Services> children = groomingRepository.findAllById(childIds);

            // 4. Map response
            CreateComboGroomingResponse res = new CreateComboGroomingResponse();
            res.setId(combo.getId());
            res.setServiceName(combo.getServiceName());
            res.setFinalPrice(combo.getFinalPrice());
            res.setImage(combo.getImageUrl());
            res.setDiscount(combo.getDiscount());

            res.setChildren(
                    children.stream().map(this::mapToResponse).toList()
            );

            return res;

        }).toList();
    }


    @Transactional
    public CreateComboGroomingResponse createComboService(CreateComboGroomingRequest req) {

        List<Services> childServices = groomingRepository.findAllById(req.getChildServiceIds());

        if (childServices.isEmpty()) {
            throw new RuntimeException("Children service list is empty");
        }

        // basePrice
        double totalBasePrice = childServices.stream()
                .mapToDouble(Services::getBasePrice)
                .sum();

        // finalPrice after discount
        int discountPercent = req.getDiscount() != null ? req.getDiscount() : 0;
        double finalPrice = totalBasePrice - (totalBasePrice * discountPercent / 100.0);

        Services combo = new Services();
        combo.setServiceName(req.getServiceName());
        combo.setDescription(req.getDescription());
        combo.setImageUrl(req.getImageUrl());
        combo.setType(GroomingEnum.COMBO);

        combo.setBasePrice(totalBasePrice);
        combo.setDiscount(discountPercent);
        combo.setFinalPrice(finalPrice);

        combo.setIsActive(true);
        combo.setStartDate(req.getStartDate());
        combo.setEndDate(req.getEndDate());

        groomingRepository.save(combo);

        for (Services child : childServices) {
            ServiceDetail detail = new ServiceDetail();
            detail.setParentServiceId(combo.getId());
            detail.setChildServiceId(child.getId());
            groomingDetailRepository.save(detail);
        }

        CreateComboGroomingResponse res = new CreateComboGroomingResponse();
        res.setId(combo.getId());
        res.setServiceName(combo.getServiceName());
        res.setFinalPrice(combo.getFinalPrice());
        res.setDiscount(combo.getDiscount());
        res.setBasePrice(combo.getBasePrice());

        List<CreateSingleGroomingResponse> childrenRes =
                childServices.stream().map(this::mapToResponse).toList();

        res.setChildren(childrenRes);

        return res;
    }



}
