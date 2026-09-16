package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.PaymentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    List<PurchaseOrder> findAll();

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    Optional<PurchaseOrder> findById(Long id);

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    Optional<PurchaseOrder> findByIssueId(Long issueId);

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    List<PurchaseOrder> findByIssue_CreatedById(Long createdById);

    long countByIssue_CreatedById(Long createdById);

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    Optional<PurchaseOrder> findByProductId(Long productId);

    List<PurchaseOrder> findByPaymentStatus(PaymentStatus paymentStatus);

    List<PurchaseOrder> findByDeliveryStatus(DeliveryStatus deliveryStatus);

    long countByDeliveryStatusNot(DeliveryStatus deliveryStatus);

    long countByDeliveryStatus(DeliveryStatus deliveryStatus);

    @EntityGraph(attributePaths = {"product", "issue", "supplier"})
    List<PurchaseOrder> findBySupplierId(Long supplierId);

    long countBySupplierId(Long supplierId);

    long countBySupplierIdAndDeliveryStatus(Long supplierId, DeliveryStatus deliveryStatus);
}
