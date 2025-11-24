package com.example.hamster_service.dto.request;

import com.example.hamster_service.enums.GenderEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHamsterRequest {

    private Long userId;

    @NotBlank(message = "Hamster name is required!")
    private String name;

    @NotNull(message = "Birth date is required!")
    private Date birthDate;

    @NotBlank(message = "Color is required!")
    private String color;

    @NotNull(message = "Gender is required!")
    private GenderEnum genderEnum;

    @NotBlank(message = "Image is required!")
    private String imageUrl;
}
