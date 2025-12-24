package com.example.booking_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class BookingServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long serviceId;
    private String serviceName;
    private Double servicePrice;
    private Integer discount;

    @ManyToOne
    @JoinColumn(name = "booking_item_id")
    private BookingItem bookingItem;
}
