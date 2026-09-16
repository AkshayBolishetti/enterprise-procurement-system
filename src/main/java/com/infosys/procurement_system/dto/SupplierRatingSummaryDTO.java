package com.infosys.procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRatingSummaryDTO {

    private Long supplierId;
    private Double averageProductRating;
    private Double averageServiceRating;
    private Long totalRatings;
    private Map<String, Long> ratingDistribution;
}
