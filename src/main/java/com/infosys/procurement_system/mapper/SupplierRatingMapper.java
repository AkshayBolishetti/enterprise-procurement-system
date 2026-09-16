package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.SupplierRatingResponseDTO;
import com.infosys.procurement_system.entity.SupplierRating;
import org.springframework.stereotype.Component;

@Component
public class SupplierRatingMapper {

    public SupplierRatingResponseDTO toDto(SupplierRating entity) {
        if (entity == null) {
            return null;
        }
        return SupplierRatingResponseDTO.builder()
                .id(entity.getId())
                .supplierId(entity.getSupplier() != null ? entity.getSupplier().getId() : null)
                .orderId(entity.getPurchaseOrder() != null ? entity.getPurchaseOrder().getId() : null)
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .userName(entity.getUser() != null ? entity.getUser().getName() : null)
                .userEmail(entity.getUser() != null ? entity.getUser().getEmail() : null)
                .productRating(entity.getProductRating())
                .serviceRating(entity.getServiceRating())
                .review(entity.getReview())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
