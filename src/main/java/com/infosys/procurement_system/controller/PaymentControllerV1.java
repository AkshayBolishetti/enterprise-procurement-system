package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.PurchaseOrderService;
import com.infosys.procurement_system.entity.Payment;
import com.infosys.procurement_system.dto.PaymentResponseDTO;
import com.infosys.procurement_system.enums.PaymentStatus;
import com.infosys.procurement_system.repository.PaymentRepository;
import com.infosys.procurement_system.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentControllerV1 {

    private final PurchaseOrderService purchaseOrderService;
    private final PaymentRepository paymentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getPayments(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Payment> payments;
        if (userDetails.getUser().getRole() == Role.ADMIN) {
            payments = paymentRepository.findAll();
        } else if (userDetails.getUser().getRole() == Role.SUPPLIER && userDetails.getUser().getSupplier() != null) {
            payments = paymentRepository.findBySupplierId(userDetails.getUser().getSupplier().getId());
        } else {
            payments = List.of();
        }

        List<PaymentResponseDTO> responseDTOs = payments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Payments retrieved", responseDTOs));
    }

    private PaymentResponseDTO toDto(Payment payment) {
        String productName = "Unknown";
        if (payment.getOrder() != null && payment.getOrder().getProduct() != null) {
            productName = payment.getOrder().getProduct().getProductName();
        }

        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .transactionReference(payment.getTxnId())
                .purchaseOrderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .productName(productName)
                .amount(payment.getAmount())
                .paymentStatus(PaymentStatus.SUCCESS) // Kept for frontend compatibility
                .paymentDate(payment.getCreatedAt() != null ? payment.getCreatedAt() : java.time.LocalDateTime.now())
                .build();
    }

    @PostMapping("/process-simulated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processSimulatedPayment(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long issueId = payload.get("issueId") != null ? Long.valueOf(payload.get("issueId").toString()) : null;
        Long productId = payload.get("productId") != null ? Long.valueOf(payload.get("productId").toString()) : null;
        Integer quantity = payload.get("quantity") != null ? Integer.valueOf(payload.get("quantity").toString()) : 1;

        if (issueId == null || productId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required order information"));
        }

        Map<String, Object> result = purchaseOrderService.processSimulatedPayment(
                issueId, productId, quantity, payload, userDetails.getUser());

        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", result));
    }
}
