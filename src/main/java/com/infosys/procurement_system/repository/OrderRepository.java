package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.dto.OrderSummaryProjection;
import com.infosys.procurement_system.entity.Order;
import com.infosys.procurement_system.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o")
    Page<OrderSummaryProjection> findAllProjectedBy(Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.status = :status")
    Page<OrderSummaryProjection> findByStatusProjected(OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.requester.id = :requesterId")
    Page<OrderSummaryProjection> findByRequesterIdProjected(Long requesterId, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.supplier.id = :supplierId")
    Page<OrderSummaryProjection> findBySupplierIdProjected(Long supplierId, Pageable pageable);

    long countByStatus(OrderStatus status);
    long countByRequesterId(Long requesterId);
    long countByRequesterIdAndStatus(Long requesterId, OrderStatus status);
    long countByStatusNot(OrderStatus status);

    // Prevent N+1 queries when fetching full order details
    @EntityGraph(attributePaths = {"items", "requester", "supplier"})
    Optional<Order> findById(Long id);
}
