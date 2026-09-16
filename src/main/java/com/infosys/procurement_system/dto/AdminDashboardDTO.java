package com.infosys.procurement_system.dto;

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
public class AdminDashboardDTO {

    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long totalProducts;
    private long totalSuppliers;
    private long activeOrders;
    private long deliveredOrders;
    private BigDecimal totalSpend;
    private BigDecimal pendingPaymentAmount;
}
