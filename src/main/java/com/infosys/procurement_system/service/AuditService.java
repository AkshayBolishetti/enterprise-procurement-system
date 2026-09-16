package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.AuditLogResponseDTO;
import com.infosys.procurement_system.entity.AuditLog;
import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.mapper.AuditLogMapper;
import com.infosys.procurement_system.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Transactional
    public AuditLog logEvent(PurchaseOrder po, String eventType, String previousStatus, String newStatus, String actor, String remarks) {
        Long supplierId = po != null && po.getSupplier() != null ? po.getSupplier().getId() : null;
        String supplierName = po != null && po.getSupplier() != null ? po.getSupplier().getSupplierName() : null;

        log.info("AUDIT LOG: [PO: {}, Supplier: {}, Event: {}, PrevStatus: {}, NewStatus: {}, Actor: {}]",
                po != null ? po.getPoNumber() : "N/A", supplierName, eventType, previousStatus, newStatus, actor);

        AuditLog auditLog = AuditLog.builder()
                .purchaseOrderId(po != null ? po.getId() : null)
                .poNumber(po != null ? po.getPoNumber() : null)
                .supplierId(supplierId)
                .supplierName(supplierName)
                .eventType(eventType)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .actor(actor)
                .remarks(remarks)
                .timestamp(LocalDateTime.now())
                .build();

        return auditLogRepository.save(auditLog);
    }

    @Transactional
    public AuditLog logIssueEvent(com.infosys.procurement_system.entity.Issue issue, String eventType, String previousStatus, String newStatus, String actor, String remarks) {
        log.info("AUDIT LOG: [Issue: {}, Event: {}, PrevStatus: {}, NewStatus: {}, Actor: {}]",
                issue != null ? issue.getIssueNumber() : "N/A", eventType, previousStatus, newStatus, actor);

        AuditLog auditLog = AuditLog.builder()
                .issueId(issue != null ? issue.getId() : null)
                .issueNumber(issue != null ? issue.getIssueNumber() : null)
                .eventType(eventType)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .actor(actor)
                .remarks(remarks)
                .timestamp(LocalDateTime.now())
                .build();

        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getAuditLogsForPurchaseOrder(Long purchaseOrderId) {
        return auditLogRepository.findByPurchaseOrderIdOrderByTimestampDesc(purchaseOrderId).stream()
                .map(auditLogMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(auditLogMapper::toDto)
                .toList();
    }
}
