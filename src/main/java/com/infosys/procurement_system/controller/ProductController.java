package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.ProductResponseDTO;
import com.infosys.procurement_system.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getAllProducts() {
        return ResponseEntity
                .ok(ApiResponse.success("Products retrieved successfully", productService.getAllProducts()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE', 'SUPPLIER')")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success("Product retrieved successfully", productService.getProductById(id)));
    }
}
