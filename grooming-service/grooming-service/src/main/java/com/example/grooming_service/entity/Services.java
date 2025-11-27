package com.example.grooming_service.entity;

import com.example.grooming_service.enums.GroomingEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "services")
public class Services {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
