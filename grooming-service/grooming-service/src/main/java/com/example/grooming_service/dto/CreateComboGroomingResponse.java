package com.example.grooming_service.dto;

import com.example.grooming_service.enums.GroomingEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
public class CreateComboGroomingResponse {
    private Long id;
    private String serviceName;
    private Double finalPrice;
    private List<CreateSingleGroomingResponse> children;
    private Integer discount;
    private Double basePrice;
    private String image;
}

