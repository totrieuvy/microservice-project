package com.example.grooming_service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateSingleGroomingRequest {

    @NotBlank(message = "Service Name is required")
    private String serviceName;

    @NotNull(message = "Base Price is required")
    private Double basePrice;

    private String description;
    private String imageUrl;

    private Integer discount;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date endDate;
}