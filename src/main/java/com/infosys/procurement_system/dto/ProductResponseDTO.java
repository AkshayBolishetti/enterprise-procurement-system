package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.ProductStatus;
import com.infosys.procurement_system.enums.SupplierProductAvailability;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {

    private Long id;
    private String sku;
    private String productName;
    private String description;
    private String category;
    private BigDecimal unitPrice;
    private BigDecimal gstRate;
    private Integer availableQuantity;
    private Integer minOrderQuantity;
    private ProductStatus status;
    private SupplierProductAvailability availability;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double averageRating;
    private Integer totalRatings;
}
