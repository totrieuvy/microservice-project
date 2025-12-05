package com.example.booking_service.entity;

import com.example.booking_service.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long hamsterId;
    private Date bookingDate;
    private String staffId;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private String startTime;
    private String endTime;
    private Double totalBasePrice;
    private Integer discount;
    private Double totalFinalPrice;
}
