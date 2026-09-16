package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.PurchaseOrderResponseDTO;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.PurchaseOrderService;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/supplier/orders")
@RequiredArgsConstructor
public class SupplierLogisticsController {

    private final PurchaseOrderService purchaseOrderService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderResponseDTO>>> getSupplierOrders(
            Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        java.util.List<PurchaseOrderResponseDTO> ordersList = purchaseOrderService.getOrdersForSupplier(
                user.getSupplier().getId());
        
        // Simple manual paging
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), ordersList.size());
        Page<PurchaseOrderResponseDTO> orders = new PageImpl<>(ordersList.subList(start, end), pageable, ordersList.size());
        
        return ResponseEntity.ok(ApiResponse.success("Supplier orders retrieved", orders));
    }

    @PutMapping("/{id}/dispatch")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<Void>> dispatchOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        purchaseOrderService.dispatchPurchaseOrder(id, payload.get("carrierName"), payload.get("trackingNumber"), user);
        return ResponseEntity.ok(ApiResponse.success("Order dispatched successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<ApiResponse<PurchaseOrderResponseDTO>> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.infosys.procurement_system.enums.DeliveryStatus newStatus = 
            com.infosys.procurement_system.enums.DeliveryStatus.valueOf(payload.get("status"));
        
        PurchaseOrderResponseDTO updatedOrder = purchaseOrderService.updateOrderStatus(id, newStatus, user);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", updatedOrder));
    }
}
