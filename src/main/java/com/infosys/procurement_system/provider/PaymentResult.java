package com.infosys.procurement_system.provider;

import com.infosys.procurement_system.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {
    private boolean success;
    private PaymentStatus status;
    private String transactionReference;
    private String failureReason;
    private LocalDateTime timestamp;
}
