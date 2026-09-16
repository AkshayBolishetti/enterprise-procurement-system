package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponseDTO {

    private Long id;
    private Long purchaseOrderId;
    private String poNumber;
    private DeliveryStatus deliveryStatus;
    private String carrier;
    private String trackingNumber;
    private String deliveryToken;
    private LocalDateTime tokenExpiry;
    private LocalDateTime shippedDate;
    private LocalDateTime outForDeliveryDate;
    private LocalDateTime deliveredDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
