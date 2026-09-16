package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponseDTO {

    private Long id;
    private String poNumber;
    private Long requestId;
    private String productCode;
    private String productName;
    private Long departmentId;
    private String departmentName;
    private Long requestedById;
    private String requestedByName;
    private String requestedByEmail;
    private Long supplierId;
    private String supplierName;
    private Long categoryId;
    private String categoryName;
    private Integer quantity;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private DeliveryStatus deliveryStatus;
    private String deliveryToken;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String carrierName;
    private String trackingNumber;
    private Boolean isRated;
}
