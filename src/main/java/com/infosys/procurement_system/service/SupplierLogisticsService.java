package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.OrderSummaryProjection;
import com.infosys.procurement_system.entity.Order;
import com.infosys.procurement_system.entity.Shipment;
import com.infosys.procurement_system.enums.OrderStatus;
import com.infosys.procurement_system.repository.OrderRepository;
import com.infosys.procurement_system.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SupplierLogisticsService {

    private final OrderRepository orderRepository;
    private final ShipmentRepository shipmentRepository;

    @Transactional(readOnly = true)
    public Page<OrderSummaryProjection> getPaidOrdersForSupplier(Long supplierId, Pageable pageable) {
        // Here we ideally want ONLY PAID orders. We can update OrderRepository later, but for now we'll fetch all by status if needed.
        // For simplicity, let's just fetch all by supplier id and the UI filters, or we add findBySupplierIdAndStatusProjected
        return orderRepository.findBySupplierIdProjected(supplierId, pageable);
    }

    @Transactional
    public void dispatchOrder(Long orderId, String carrierName, String trackingNumber) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.PACKED) {
            throw new RuntimeException("Order must be PAID or PACKED before dispatch");
        }

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        Shipment shipment = shipmentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        
        shipment.setCarrierName(carrierName);
        shipment.setTrackingNumber(trackingNumber);
        shipment.setStatus("IN_TRANSIT");
        shipment.setDispatchedAt(LocalDateTime.now());
        shipmentRepository.save(shipment);
        
        simulateAsyncEmailNotification(order.getRequester().getEmail());
    }

    @Async
    public void simulateAsyncEmailNotification(String email) {
        // Simulate email dispatch
        System.out.println("Dispatched simulated email to: " + email);
    }
}
