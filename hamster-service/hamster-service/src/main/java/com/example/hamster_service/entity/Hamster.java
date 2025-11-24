package com.example.hamster_service.entity;

import com.example.hamster_service.enums.GenderEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hamsters")
public class Hamster {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String name;

    private Date birthDate;

    private String color;

    @Enumerated(EnumType.STRING)
    private GenderEnum genderEnum;

    private String imageUrl;
}
