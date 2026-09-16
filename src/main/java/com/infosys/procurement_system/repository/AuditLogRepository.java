package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByPurchaseOrderIdOrderByTimestampDesc(Long purchaseOrderId);

    List<AuditLog> findAllByOrderByTimestampDesc();
}
