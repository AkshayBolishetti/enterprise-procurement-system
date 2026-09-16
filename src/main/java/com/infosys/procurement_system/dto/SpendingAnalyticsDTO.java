package com.infosys.procurement_system.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SpendingAnalyticsDTO {
    private String period;
    private BigDecimal totalSpending;
    private Long transactionCount;
    private BigDecimal averageSpending;
    private List<DataPoint> data;

    @Data
    @Builder
    public static class DataPoint {
        private String label;
        private BigDecimal amount;
    }
}
