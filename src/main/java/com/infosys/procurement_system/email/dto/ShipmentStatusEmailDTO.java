package com.infosys.procurement_system.email.dto;

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
public class ShipmentStatusEmailDTO {
    private String recipientEmail;
    private String recipientName;
    private String purchaseOrderId;
    private String productName;
    private String categoryName;
    private String supplierName;
    private String deliveryStatus;
    private String trackingNumber;
    private String carrier;
    private String poNumber;
    private Integer quantity;
    private LocalDateTime shippedDate;
    private LocalDateTime outForDeliveryDate;
    private LocalDateTime deliveredDate;
    private String remarks;
}
