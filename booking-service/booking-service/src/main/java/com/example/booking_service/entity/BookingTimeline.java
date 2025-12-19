package com.example.booking_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingTimeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long bookingId;
    private Date bookingTime;
    private String checkInUrl;
    private Date checkInTime;
    private String checkOutUrl;
    private Date checkOutTime;
    private Date paymentTime;
    private Date inProgressTime;
    private Date cancelTime;
    private Date noShowTime;
    private String failTime;
}
