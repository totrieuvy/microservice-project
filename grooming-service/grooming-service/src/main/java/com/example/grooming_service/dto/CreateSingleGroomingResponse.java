package com.example.grooming_service.dto;

import com.example.grooming_service.enums.GroomingEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSingleGroomingResponse {

    private Long id;
    private String serviceName;
    @Enumerated(EnumType.STRING)
    private GroomingEnum type = GroomingEnum.SINGLE;
    private Double basePrice = 0.0;
    private Integer discount = 0;
    private Double finalPrice = 0.0;
    private String description;
    private String imageUrl;
    private Date startDate;
    private Date endDate;
    private Boolean isActive = true;
}
