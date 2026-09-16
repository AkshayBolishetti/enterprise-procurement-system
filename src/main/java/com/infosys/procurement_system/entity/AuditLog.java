package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_po_id", columnList = "purchase_order_id"),
        @Index(name = "idx_audit_event_type", columnList = "event_type"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "purchase_order_id")
    private Long purchaseOrderId;

    @Column(name = "issue_id")
    private Long issueId;

    @Column(name = "issue_number", length = 50)
    private String issueNumber;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 150)
    private String supplierName;

    @NotBlank(message = "Event type is mandatory")
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "previous_status", length = 50)
    private String previousStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(name = "actor", length = 100)
    private String actor;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
}
