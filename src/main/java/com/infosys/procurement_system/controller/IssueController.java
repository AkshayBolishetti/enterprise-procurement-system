package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.IssueRequestDTO;
import com.infosys.procurement_system.dto.IssueResponseDTO;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.IssueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final com.infosys.procurement_system.service.PurchaseOrderService purchaseOrderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Page<IssueResponseDTO>>> getAllIssues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Issues retrieved successfully", 
                issueService.getAllIssues(search, status, pageable)));
    }

    @GetMapping("/my-issues")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<IssueResponseDTO>>> getMyIssues(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            Pageable pageable,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("My issues retrieved successfully",
                issueService.getMyIssues(search, status, pageable, userDetails.getUser())));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<com.infosys.procurement_system.dto.PurchaseOrderResponseDTO>>> getMyOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("My orders retrieved successfully",
                purchaseOrderService.getMyOrders(userDetails.getUser())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<IssueResponseDTO>> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Issue retrieved successfully", issueService.getIssueById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<IssueResponseDTO>> createIssue(
            @Valid @RequestBody IssueRequestDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        IssueResponseDTO created = issueService.createIssue(requestDTO, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Issue created successfully", created));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<IssueResponseDTO>> reviewIssue(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String status = payload.get("status");
        String rejectionReason = payload.get("rejectionReason");
        IssueResponseDTO updated = issueService.reviewIssue(id, status, rejectionReason, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Issue status updated successfully", updated));
    }
}
