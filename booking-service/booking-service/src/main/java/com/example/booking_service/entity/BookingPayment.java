package com.example.booking_service.entity;

import com.example.booking_service.entity.enums.PaymentMethod;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookingPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long bookingId;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String responseCode;
}
