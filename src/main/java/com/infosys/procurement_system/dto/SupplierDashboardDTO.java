package com.infosys.procurement_system.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDashboardDTO {
    private long totalProducts;
    private long activeProducts;
    private long lowStock;
    private long outOfStock;
    private BigDecimal totalReceived;
    private long totalOrders;
    private long pendingOrders;
    private long shippedOrders;
    private long deliveredOrders;
}
