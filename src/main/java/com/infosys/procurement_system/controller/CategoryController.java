package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.CategoryRequestDTO;
import com.infosys.procurement_system.dto.CategoryResponseDTO;
import com.infosys.procurement_system.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(
            @Valid @RequestBody CategoryRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", categoryService.createCategory(requestDTO)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getAllCategories() {
        return ResponseEntity
                .ok(ApiResponse.success("Categories retrieved successfully", categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success("Category retrieved successfully", categoryService.getCategoryById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> updateCategory(@PathVariable Long id,
            @Valid @RequestBody CategoryRequestDTO requestDTO) {
        return ResponseEntity.ok(
                ApiResponse.success("Category updated successfully", categoryService.updateCategory(id, requestDTO)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }
}
