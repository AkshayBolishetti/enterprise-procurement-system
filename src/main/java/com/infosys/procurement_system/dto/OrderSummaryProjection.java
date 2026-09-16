package com.infosys.procurement_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface OrderSummaryProjection {
    Long getId();
    String getOrderNumber();
    String getStatus();
    BigDecimal getTotalAmount();
    LocalDateTime getCreatedAt();
    
    // Requester info
    RequesterSummary getRequester();
    interface RequesterSummary {
        String getName();
        String getEmployeeId();
    }
}
