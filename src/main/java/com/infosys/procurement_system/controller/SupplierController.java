package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.SupplierDTO;
import com.infosys.procurement_system.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {
    
    private final SupplierService supplierService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<List<SupplierDTO>>> getAllSuppliers() {
        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved", supplierService.getAllSuppliers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<SupplierDTO>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Supplier retrieved", supplierService.getSupplierById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupplierDTO>> createSupplier(@RequestBody SupplierDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Supplier created", supplierService.createSupplier(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SupplierDTO>> updateSupplier(@PathVariable Long id, @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Supplier updated", supplierService.updateSupplier(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted"));
    }
}
