package com.infosys.procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierRatingResponseDTO {

    private Long id;
    private Long supplierId;
    private Long orderId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Integer productRating;
    private Integer serviceRating;
    private String review;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
