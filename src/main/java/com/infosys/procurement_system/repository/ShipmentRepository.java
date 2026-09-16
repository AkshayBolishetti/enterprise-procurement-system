package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Shipment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @EntityGraph(attributePaths = {"order"})
    Optional<Shipment> findByOrder_Id(Long orderId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}
