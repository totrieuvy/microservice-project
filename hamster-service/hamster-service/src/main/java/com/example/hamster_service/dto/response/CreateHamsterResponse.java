package com.example.hamster_service.dto.response;

import com.example.hamster_service.enums.GenderEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateHamsterResponse {
    private Long id;
    private Long userId;
    private String name;
    private Date birthDate;
    private String color;
    private GenderEnum genderEnum;
    private String imageUrl;
}
