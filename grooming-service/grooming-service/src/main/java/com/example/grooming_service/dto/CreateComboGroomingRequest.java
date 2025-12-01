package com.example.grooming_service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
public class CreateComboGroomingRequest {
    private String serviceName;
    private String description;
    private String imageUrl;
    private List<Long> childServiceIds;
}
