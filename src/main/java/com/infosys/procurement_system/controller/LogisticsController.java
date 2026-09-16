package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.entity.Shipment;
import com.infosys.procurement_system.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
public class LogisticsController {

    private final ShipmentRepository shipmentRepository;

    @GetMapping("/track/{orderId}")
    public ResponseEntity<ApiResponse<Shipment>> trackShipment(@PathVariable Long orderId) {
        Shipment shipment = shipmentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found for order: " + orderId));
        return ResponseEntity.ok(ApiResponse.success("Shipment tracking retrieved", shipment));
    }
}
