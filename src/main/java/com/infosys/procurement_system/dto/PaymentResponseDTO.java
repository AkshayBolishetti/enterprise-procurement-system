package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.PaymentMethod;
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
public class PaymentResponseDTO {

    private Long id;
    private String transactionReference;
    private Long requestId;
    private Long purchaseOrderId;
    private String deliveryToken;
    private String productName;
    private String productCode;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private Long paidById;
    private String paidByName;
    private String paidByEmail;
    private Long requestedById;
    private String requestedByName;
    private String departmentName;
    private String categoryName;
    private LocalDateTime paymentDate;
    private String failureReason;
    private String idempotencyKey;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
