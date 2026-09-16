package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.AdminDashboardDTO;
import com.infosys.procurement_system.dto.PurchaseOrderResponseDTO;
import com.infosys.procurement_system.dto.SpendingAnalyticsDTO;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.DashboardService;
import com.infosys.procurement_system.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardService dashboardService;
    private final com.infosys.procurement_system.service.AuditService auditService;
    private final PurchaseOrderService purchaseOrderService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDTO>> getDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard data retrieved successfully", dashboardService.getAdminDashboard(currentUser)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<java.util.List<com.infosys.procurement_system.dto.AuditLogResponseDTO>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", auditService.getAllAuditLogs()));
    }

    @GetMapping("/purchase-orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponseDTO>>> getAllPurchaseOrders() {
        return ResponseEntity.ok(ApiResponse.success("Purchase orders retrieved successfully",
                purchaseOrderService.getAllPurchaseOrders()));
    }

    @GetMapping("/spending")
    public ResponseEntity<ApiResponse<SpendingAnalyticsDTO>> getSpendingAnalytics(@RequestParam(defaultValue = "weekly") String period) {
        return ResponseEntity.ok(ApiResponse.success("Spending analytics retrieved successfully", dashboardService.getSpendingAnalytics(period)));
    }
}

