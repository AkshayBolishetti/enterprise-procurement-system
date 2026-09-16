package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.OrderMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderMessageRepository extends JpaRepository<OrderMessage, Long> {
    List<OrderMessage> findByPurchaseOrderIdOrderByTimestampAsc(Long purchaseOrderId);
}
