package com.infosys.procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponseDTO {

    private Long id;
    private Long purchaseOrderId;
    private String poNumber;
    private Long supplierId;
    private String supplierName;
    private String eventType;
    private String previousStatus;
    private String newStatus;
    private String actor;
    private String remarks;
    private LocalDateTime timestamp;
}
