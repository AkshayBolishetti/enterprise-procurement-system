package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.DepartmentRequestDTO;
import com.infosys.procurement_system.dto.DepartmentResponseDTO;
import com.infosys.procurement_system.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> createDepartment(
            @Valid @RequestBody DepartmentRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully",
                        departmentService.createDepartment(requestDTO)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DepartmentResponseDTO>>> getAllDepartments() {
        return ResponseEntity
                .ok(ApiResponse.success("Departments retrieved successfully", departmentService.getAllDepartments()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> getDepartmentById(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success("Department retrieved successfully", departmentService.getDepartmentById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponseDTO>> updateDepartment(@PathVariable Long id,
            @Valid @RequestBody DepartmentRequestDTO requestDTO) {
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully",
                departmentService.updateDepartment(id, requestDTO)));
    }



    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department operation completed"));
    }
}
