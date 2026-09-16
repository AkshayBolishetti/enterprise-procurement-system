package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.OrderMessageDTO;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.OrderMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders/{orderId}/messages")
@RequiredArgsConstructor
public class OrderMessageController {

    private final OrderMessageService orderMessageService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<List<OrderMessageDTO>>> getMessages(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Messages retrieved", 
                orderMessageService.getMessagesForOrder(orderId, userDetails.getUser())));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<OrderMessageDTO>> sendMessage(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success("Message sent", orderMessageService.sendMessage(orderId, message, userDetails.getUser()))
        );
    }
}
