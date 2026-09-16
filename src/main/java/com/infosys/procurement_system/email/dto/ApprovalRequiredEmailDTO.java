package com.infosys.procurement_system.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequiredEmailDTO {
    private String adminEmail;
    private String entityType;
    private String entityId;
    private String entityName;
    private String requestedBy;
    private String requestedByEmail;
    private String department;
    private String details;
    private LocalDateTime requestTime;
}
