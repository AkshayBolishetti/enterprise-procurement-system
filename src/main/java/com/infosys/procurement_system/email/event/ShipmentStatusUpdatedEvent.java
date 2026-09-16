package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.entity.Shipment;
import com.infosys.procurement_system.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@AllArgsConstructor
@Builder
public class ShipmentStatusUpdatedEvent {
    private final PurchaseOrder purchaseOrder;
    private final Shipment shipment;
    private final DeliveryStatus previousStatus;
    private final DeliveryStatus newStatus;
    private final String remarks;
}
