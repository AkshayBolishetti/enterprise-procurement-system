package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.ProductRequestDTO;
import com.infosys.procurement_system.dto.ProductResponseDTO;
import com.infosys.procurement_system.dto.SupplierDashboardDTO;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.SupplierProductAvailability;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/supplier")
@PreAuthorize("hasRole('SUPPLIER')")
@RequiredArgsConstructor
public class SupplierPortalController {

    private final ProductService productService;
    private final UserRepository userRepository;
    private final com.infosys.procurement_system.service.DashboardService dashboardService;

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<SupplierDashboardDTO>> getSupplierDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getSupplier() == null) {
            return ResponseEntity.ok(ApiResponse.success("Supplier dashboard",
                    SupplierDashboardDTO.builder()
                            .totalProducts(0).activeProducts(0).lowStock(0).outOfStock(0)
                            .totalReceived(BigDecimal.ZERO).totalOrders(0).build()));
        }

        SupplierDashboardDTO dto = dashboardService.getSupplierDashboard(user);
        return ResponseEntity.ok(ApiResponse.success("Supplier dashboard retrieved", dto));
    }

        @GetMapping("/products")
        public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getMyProducts(
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                User user = userRepository.findById(userDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                List<ProductResponseDTO> products = productService.getMyProducts(user);
                return ResponseEntity.ok(ApiResponse.success("Supplier products retrieved", products));
        }

        @PostMapping("/products")
        public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(
                        @Valid @RequestBody ProductRequestDTO requestDTO,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                User user = userRepository.findById(userDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                ProductResponseDTO created = productService.createProduct(requestDTO, user);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Product created successfully", created));
        }

        @PutMapping("/products/{id}")
        public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(
                        @PathVariable Long id,
                        @Valid @RequestBody ProductRequestDTO requestDTO,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                User user = userRepository.findById(userDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                ProductResponseDTO updated = productService.updateProduct(id, requestDTO, user);
                return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
        }

        @DeleteMapping("/products/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteProduct(
                        @PathVariable Long id,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                User user = userRepository.findById(userDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                productService.deleteProduct(id, user);
                return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
        }

        @PatchMapping("/products/{id}/availability")
        public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProductAvailability(
                        @PathVariable Long id,
                        @RequestBody Map<String, String> payload,
                        @AuthenticationPrincipal CustomUserDetails userDetails) {
                User user = userRepository.findById(userDetails.getUser().getId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                SupplierProductAvailability availability = SupplierProductAvailability
                                .valueOf(payload.get("availability"));
                ProductResponseDTO updated = productService.updateProductAvailability(id, availability, user);
                return ResponseEntity.ok(ApiResponse.success("Product availability updated", updated));
        }
}
