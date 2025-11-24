package com.example.grooming_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateGroomingRequest {
    private String serviceName;
    private Double price;
    private String description;
}
