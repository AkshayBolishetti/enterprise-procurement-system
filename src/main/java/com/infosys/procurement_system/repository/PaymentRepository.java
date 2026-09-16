package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Payment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    List<Payment> findAll();

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    Optional<Payment> findById(Long id);

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    Optional<Payment> findByOrder_Id(Long orderId);

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    Optional<Payment> findByOrder_IdAndStatus(Long orderId, String status);

    boolean existsByOrder_IdAndStatus(Long orderId, String status);

    Optional<Payment> findByTxnId(String txnId);

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    List<Payment> findBySupplierId(Long supplierId);

    @EntityGraph(attributePaths = {"order", "supplier", "admin"})
    List<Payment> findByStatus(String status);

    // Dashboard aggregate queries
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") String status);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountByStatusAndDateBetween(@Param("status") String status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<Payment> findByStatusAndCreatedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate);
}
