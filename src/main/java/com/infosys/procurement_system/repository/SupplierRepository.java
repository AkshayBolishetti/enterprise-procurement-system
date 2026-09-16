package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findFirstByActiveTrue();
    long countByActiveTrue();
}
