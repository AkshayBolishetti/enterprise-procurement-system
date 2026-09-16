package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.PurchaseOrderResponseDTO;
import com.infosys.procurement_system.entity.PurchaseOrder;
import org.springframework.stereotype.Component;

@Component
public class PurchaseOrderMapper {

    public PurchaseOrderResponseDTO toDto(PurchaseOrder entity) {
        if (entity == null) {
            return null;
        }
        return PurchaseOrderResponseDTO.builder()
                .id(entity.getId())
                .poNumber(entity.getPoNumber())
                .requestId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productCode(entity.getProduct() != null ? entity.getProduct().getProductCode() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getProductName() : null)
                .departmentId(entity.getIssue() != null && entity.getIssue().getCreatedBy() != null && entity.getIssue().getCreatedBy().getDepartment() != null ? entity.getIssue().getCreatedBy().getDepartment().getId() : null)
                .departmentName(entity.getIssue() != null && entity.getIssue().getCreatedBy() != null && entity.getIssue().getCreatedBy().getDepartment() != null ? entity.getIssue().getCreatedBy().getDepartment().getDepartmentName() : null)
                .requestedById(entity.getIssue() != null && entity.getIssue().getCreatedBy() != null ? entity.getIssue().getCreatedBy().getId() : null)
                .requestedByName(entity.getIssue() != null && entity.getIssue().getCreatedBy() != null ? entity.getIssue().getCreatedBy().getName() : null)
                .requestedByEmail(entity.getIssue() != null && entity.getIssue().getCreatedBy() != null ? entity.getIssue().getCreatedBy().getEmail() : null)
                .supplierId(entity.getSupplier() != null ? entity.getSupplier().getId() : null)
                .supplierName(entity.getSupplier() != null ? entity.getSupplier().getSupplierName() : null)
                .categoryId(null)
                .categoryName(entity.getProduct() != null ? entity.getProduct().getCategory() : null)
                .quantity(entity.getQuantity())
                .totalAmount(entity.getTotalAmount())
                .paymentStatus(entity.getPaymentStatus())
                .deliveryStatus(entity.getDeliveryStatus())
                .expectedDeliveryDate(entity.getExpectedDeliveryDate())
                .actualDeliveryDate(entity.getActualDeliveryDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
