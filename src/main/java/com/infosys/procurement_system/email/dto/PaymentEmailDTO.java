package com.infosys.procurement_system.email.dto;

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
public class PaymentEmailDTO {
    private String recipientEmail;
    private String recipientName;
    private String poNumber;
    private Long purchaseOrderId;
    private Long requestId;
    private String productName;
    private Integer quantity;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String transactionReference;
    private LocalDateTime paymentDate;
    private String deliveryAddress;
    private String supplierName;
}
