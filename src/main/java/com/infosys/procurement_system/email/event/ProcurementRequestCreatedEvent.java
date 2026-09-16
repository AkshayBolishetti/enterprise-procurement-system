package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Product;
import lombok.Getter;

@Getter
public class ProcurementRequestCreatedEvent {
    private final Product product;

    public ProcurementRequestCreatedEvent(Product product) {
        this.product = product;
    }
}
