package com.infosys.procurement_system.email.event;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApprovalRequiredEvent {
    private final String entityType;
    private final String entityId;
    private final String entityName;
    private final String requestedBy;
    private final String requestedByEmail;
    private final String department;
    private final String details;
    @Builder.Default
    private final LocalDateTime requestTime = LocalDateTime.now();
}
