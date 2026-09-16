package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.AdminPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/payment-settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentSettingsController {

    private final AdminPaymentService adminPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Payment settings retrieved", 
                adminPaymentService.getPaymentSettings(userDetails.getUser())));
    }

    @PostMapping("/mpin")
    public ResponseEntity<ApiResponse<Void>> setupMpin(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String mpin = payload.get("mpin");
        String currentMpin = payload.get("currentMpin");

        if (mpin == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New MPIN is required"));
        }
        
        try {
            if (adminPaymentService.hasMpin(userDetails.getUser())) {
                if (currentMpin == null) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Current MPIN is required to change it"));
                }
                adminPaymentService.changeMpin(userDetails.getUser(), currentMpin, mpin);
            } else {
                adminPaymentService.setupMpin(userDetails.getUser(), mpin);
            }
            return ResponseEntity.ok(ApiResponse.success("MPIN saved successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/cards")
    public ResponseEntity<ApiResponse<Void>> addCard(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String cardholderName = payload.get("cardholderName");
        String cardNumber = payload.get("cardNumber");
        String pin = payload.get("pin");
        
        if (cardholderName == null || cardNumber == null || pin == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Card details are required"));
        }
        
        adminPaymentService.addSavedCard(userDetails.getUser(), cardholderName, cardNumber, pin);
        return ResponseEntity.ok(ApiResponse.success("Card added successfully"));
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<Void>> removeCard(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        adminPaymentService.removeSavedCard(userDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Card removed successfully"));
    }
}
