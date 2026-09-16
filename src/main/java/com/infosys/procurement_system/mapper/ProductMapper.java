package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.ProductRequestDTO;
import com.infosys.procurement_system.dto.ProductResponseDTO;
import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.entity.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductRequestDTO dto, Supplier supplier) {
        if (dto == null) {
            return null;
        }

        return Product.builder()
                .sku(dto.getSku())
                .productCode(dto.getSku())
                .productName(dto.getProductName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .unitPrice(dto.getUnitPrice())
                .gstRate(dto.getGstRate())
                .availableQuantity(dto.getAvailableQuantity())
                .minOrderQuantity(dto.getMinOrderQuantity())
                .status(dto.getStatus())
                .availability(dto.getAvailability() != null ? dto.getAvailability() : com.infosys.procurement_system.enums.SupplierProductAvailability.ACTIVE)
                .supplier(supplier)
                .build();
    }

    public ProductResponseDTO toDto(Product entity) {
        if (entity == null) {
            return null;
        }
        return ProductResponseDTO.builder()
                .id(entity.getId())
                .sku(entity.getSku())
                .productName(entity.getProductName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .unitPrice(entity.getUnitPrice())
                .gstRate(entity.getGstRate())
                .availableQuantity(entity.getAvailableQuantity())
                .minOrderQuantity(entity.getMinOrderQuantity())
                .status(entity.getStatus())
                .availability(entity.getAvailability())
                .supplierId(entity.getSupplier() != null ? entity.getSupplier().getId() : null)
                .supplierName(entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null)
                .averageRating(entity.getAverageRating())
                .totalRatings(entity.getTotalRatings())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromDto(ProductRequestDTO dto, Product entity, Supplier supplier) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setSku(dto.getSku());
        entity.setProductCode(dto.getSku());
        entity.setProductName(dto.getProductName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setUnitPrice(dto.getUnitPrice());
        entity.setGstRate(dto.getGstRate());
        entity.setAvailableQuantity(dto.getAvailableQuantity());
        entity.setMinOrderQuantity(dto.getMinOrderQuantity());
        entity.setStatus(dto.getStatus());
        if (dto.getAvailability() != null) {
            entity.setAvailability(dto.getAvailability());
        }
        entity.setSupplier(supplier);
    }
}
