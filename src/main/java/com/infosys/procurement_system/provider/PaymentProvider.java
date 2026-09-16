package com.infosys.procurement_system.provider;

public interface PaymentProvider {
    PaymentResult processPayment(PaymentProcessCommand command);
}
