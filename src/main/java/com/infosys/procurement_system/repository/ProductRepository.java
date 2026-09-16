package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.enums.ProductStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @EntityGraph(attributePaths = {"supplier"})
    List<Product> findAll();

    @EntityGraph(attributePaths = {"supplier"})
    Optional<Product> findById(Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    @EntityGraph(attributePaths = {"supplier"})
    Optional<Product> findBySku(String sku);

    @EntityGraph(attributePaths = {"supplier"})
    List<Product> findBySupplierId(Long supplierId);

    @EntityGraph(attributePaths = {"supplier"})
    List<Product> findByStatus(ProductStatus status);

    long countByStatus(ProductStatus status);

    long countBySupplierId(Long supplierId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Product p WHERE p.supplier.id = :supplierId AND p.status = :status")
    long countBySupplierIdAndStatus(@org.springframework.data.repository.query.Param("supplierId") Long supplierId, @org.springframework.data.repository.query.Param("status") ProductStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Product p WHERE p.supplier.id = :supplierId AND p.availableQuantity < 10 AND p.availableQuantity > 0")
    long countLowStockBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(p) FROM Product p WHERE p.supplier.id = :supplierId AND p.availableQuantity = 0")
    long countOutOfStockBySupplierId(@org.springframework.data.repository.query.Param("supplierId") Long supplierId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
