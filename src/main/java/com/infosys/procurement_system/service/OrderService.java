package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.OrderSummaryProjection;
import com.infosys.procurement_system.entity.Order;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.OrderStatus;
import com.infosys.procurement_system.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public Page<OrderSummaryProjection> getRequests(String statusFilter, Pageable pageable, User currentUser) {
        if (currentUser.getRole().name().equals("ADMIN")) {
            if ("ALL".equalsIgnoreCase(statusFilter) || statusFilter == null) {
                return orderRepository.findAllProjectedBy(pageable);
            } else {
                return orderRepository.findByStatusProjected(OrderStatus.valueOf(statusFilter.toUpperCase()), pageable);
            }
        } else if (currentUser.getRole().name().equals("EMPLOYEE")) {
            return orderRepository.findByRequesterIdProjected(currentUser.getId(), pageable);
        } else if (currentUser.getRole().name().equals("SUPPLIER")) {
            if (currentUser.getSupplier() != null) {
                return orderRepository.findBySupplierIdProjected(currentUser.getSupplier().getId(), pageable);
            }
        }
        return Page.empty(pageable);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderDetails(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }
}
