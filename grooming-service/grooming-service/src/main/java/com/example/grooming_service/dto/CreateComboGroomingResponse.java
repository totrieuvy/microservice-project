package com.example.grooming_service.dto;

import com.example.grooming_service.enums.GroomingEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateComboGroomingResponse {

    private Long id;
    private String serviceName;

    @Enumerated(EnumType.STRING)
    private GroomingEnum type;
    private Double basePrice;
    private Integer discount;
    private Double finalPrice;
    private String description;
    private String imageUrl;
    private Date startDate;
    private Date endDate;
    private Boolean isActive = true;
}
