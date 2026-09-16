package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.SupplierRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRatingRepository extends JpaRepository<SupplierRating, Long> {

    Optional<SupplierRating> findByPurchaseOrderId(Long purchaseOrderId);

    boolean existsByPurchaseOrderId(Long purchaseOrderId);

    List<SupplierRating> findBySupplierIdOrderByCreatedAtDesc(Long supplierId);

    Optional<SupplierRating> findByIdAndUserId(Long id, Long userId);

    Long countBySupplierId(Long supplierId);

    @Query("SELECT AVG((r.productRating + r.serviceRating) / 2.0) FROM SupplierRating r WHERE r.supplier.id = :supplierId")
    Double findAverageRatingBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT AVG(r.productRating) FROM SupplierRating r WHERE r.supplier.id = :supplierId")
    Double findAverageProductRatingBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT AVG(r.serviceRating) FROM SupplierRating r WHERE r.supplier.id = :supplierId")
    Double findAverageServiceRatingBySupplierId(@Param("supplierId") Long supplierId);

    @Query("SELECT AVG(r.productRating) FROM SupplierRating r WHERE r.purchaseOrder.product.id = :productId")
    Double findAverageProductRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM SupplierRating r WHERE r.purchaseOrder.product.id = :productId")
    Integer countRatingsByProductId(@Param("productId") Long productId);
}
