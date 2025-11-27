package com.example.grooming_service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateComboGroomingRequest {

    @NotNull(message = "Service Name is required")
    @NotEmpty(message = "Service Name is required")
    private String serviceName;

    @NotNull(message = "Base Price is required")
    private Double basePrice;

    private Integer discount = 0;

    private String description;
    private String imageUrl;
    private Date startDate;
    private Date endDate;

    @NotNull(message = "Child Service Ids are required for a combo service")
    @NotEmpty(message = "Child Service Ids cannot be empty for a combo service")
    private List<Long> childServiceIds;
}