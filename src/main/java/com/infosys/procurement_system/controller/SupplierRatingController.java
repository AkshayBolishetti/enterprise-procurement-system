package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.dto.SupplierRatingRequestDTO;
import com.infosys.procurement_system.dto.SupplierRatingResponseDTO;
import com.infosys.procurement_system.dto.SupplierRatingSummaryDTO;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.SupplierRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers/{supplierId}")
@RequiredArgsConstructor
public class SupplierRatingController {

    private final SupplierRatingService supplierRatingService;

    // Rate a supplier for a delivered order
    @PostMapping("/ratings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SupplierRatingResponseDTO>> createRating(
            @PathVariable Long supplierId,
            @Valid @RequestBody SupplierRatingRequestDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        SupplierRatingResponseDTO response = supplierRatingService.createRating(supplierId, requestDTO, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier rated successfully", response));
    }

    // Get all ratings for a supplier
    @GetMapping("/ratings")
    public ResponseEntity<ApiResponse<List<SupplierRatingResponseDTO>>> getRatingsForSupplier(
            @PathVariable Long supplierId) {
        List<SupplierRatingResponseDTO> list = supplierRatingService.getRatingsForSupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier ratings retrieved successfully", list));
    }

    // Get supplier rating summary
    @GetMapping("/rating-summary")
    public ResponseEntity<ApiResponse<SupplierRatingSummaryDTO>> getSupplierRatingSummary(
            @PathVariable Long supplierId) {
        SupplierRatingSummaryDTO summary = supplierRatingService.getSupplierRatingSummary(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier rating summary retrieved successfully", summary));
    }

    // Optional: Update existing rating
    @PutMapping("/ratings/{ratingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SupplierRatingResponseDTO>> updateRating(
            @PathVariable Long supplierId,
            @PathVariable Long ratingId,
            @Valid @RequestBody SupplierRatingRequestDTO requestDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        SupplierRatingResponseDTO response = supplierRatingService.updateRating(supplierId, ratingId, requestDTO, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Rating updated successfully", response));
    }

    // Optional: Delete existing rating
    @DeleteMapping("/ratings/{ratingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @PathVariable Long supplierId,
            @PathVariable Long ratingId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        supplierRatingService.deleteRating(supplierId, ratingId, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Rating deleted successfully"));
    }
}
