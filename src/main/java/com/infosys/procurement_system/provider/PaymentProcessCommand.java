package com.infosys.procurement_system.provider;

import com.infosys.procurement_system.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessCommand {
    private Long requestId;
    private String productCode;
    private BigDecimal amount;
    private String currency;
    private PaymentMethod paymentMethod;
    private String adminEmail;
}
