package com.example.hamster_service.dto.response;

import com.example.hamster_service.enums.GenderEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.util.Date;

@Data
public class ListHamster {
    private Long id;

    private Long userId;

    private String name;

    private Date birthDate;

    private String color;

    @Enumerated(EnumType.STRING)
    private GenderEnum genderEnum;

    private String imageUrl;
}
