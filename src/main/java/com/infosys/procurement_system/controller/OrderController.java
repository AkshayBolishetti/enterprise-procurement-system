package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.OrderSummaryProjection;
import com.infosys.procurement_system.entity.Order;
import com.infosys.procurement_system.enums.OrderStatus;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderSummaryProjection>>> getRequests(
            @RequestParam(defaultValue = "ALL") String status,
            Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Page<OrderSummaryProjection> orders = orderService.getRequests(status, pageable, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved", orderService.getOrderDetails(id)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        
        String newStatusStr = payload.get("status");
        if (newStatusStr == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
        }
        
        OrderStatus newStatus = OrderStatus.valueOf(newStatusStr.toUpperCase());
        orderService.updateOrderStatus(id, newStatus);
        
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully"));
    }
}
