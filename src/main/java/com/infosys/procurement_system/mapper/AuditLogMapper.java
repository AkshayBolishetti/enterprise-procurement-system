package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.AuditLogResponseDTO;
import com.infosys.procurement_system.entity.AuditLog;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogResponseDTO toDto(AuditLog entity) {
        if (entity == null) {
            return null;
        }
        return AuditLogResponseDTO.builder()
                .id(entity.getId())
                .purchaseOrderId(entity.getPurchaseOrderId())
                .poNumber(entity.getPoNumber())
                .supplierId(entity.getSupplierId())
                .supplierName(entity.getSupplierName())
                .eventType(entity.getEventType())
                .previousStatus(entity.getPreviousStatus())
                .newStatus(entity.getNewStatus())
                .actor(entity.getActor())
                .remarks(entity.getRemarks())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
