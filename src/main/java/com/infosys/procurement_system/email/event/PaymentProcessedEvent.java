package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Payment;
import lombok.Getter;

@Getter
public class PaymentProcessedEvent {
    private final Payment payment;

    public PaymentProcessedEvent(Payment payment) {
        this.payment = payment;
    }
}
