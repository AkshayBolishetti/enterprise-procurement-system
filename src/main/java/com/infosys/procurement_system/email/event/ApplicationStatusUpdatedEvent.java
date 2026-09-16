package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Product;
import lombok.Getter;

@Getter
public class ApplicationStatusUpdatedEvent {
    private final Product product;
    private final String previousStatus;
    private final String adminRemarks;

    public ApplicationStatusUpdatedEvent(Product product, String previousStatus, String adminRemarks) {
        this.product = product;
        this.previousStatus = previousStatus;
        this.adminRemarks = adminRemarks;
    }
}
