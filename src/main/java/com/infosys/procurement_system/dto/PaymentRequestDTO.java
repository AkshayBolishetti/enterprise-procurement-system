package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.PaymentMethod;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {

    @NotNull(message = "Request ID is mandatory")
    private Long requestId;

    @NotNull(message = "Payment method is mandatory")
    private PaymentMethod paymentMethod;

    @Positive(message = "Payment amount must be greater than zero")
    @Digits(integer = 12, fraction = 2, message = "Amount format is invalid")
    private BigDecimal amount;

    private String currency;

    private String idempotencyKey;
}
