package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments", indexes = {
        @Index(name = "idx_shipment_order", columnList = "order_id"),
        @Index(name = "idx_shipment_tracking", columnList = "tracking_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "carrier_name", length = 100)
    private String carrierName;

    @Size(max = 100, message = "Tracking number must not exceed 100 characters")
    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @NotNull(message = "Status is mandatory")
    @Column(name = "status", nullable = false, length = 30)
    private String status; // PENDING, PICKED_UP, IN_TRANSIT, DELIVERED

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "estimated_delivery")
    private LocalDateTime estimatedDelivery;
    
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
}
