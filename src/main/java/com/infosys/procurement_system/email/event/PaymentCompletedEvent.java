package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Payment;
import com.infosys.procurement_system.entity.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PaymentCompletedEvent {
    private final Payment payment;
    private final PurchaseOrder purchaseOrder;
}
