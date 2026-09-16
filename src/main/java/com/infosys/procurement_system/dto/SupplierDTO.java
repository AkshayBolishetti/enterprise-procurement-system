package com.infosys.procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private Long id;
    private String supplierName;
    private String email;
    private String phone;
    private String address;
    private String gstNumber;
    private Boolean active;
    private Double rating;
    private List<Long> categoryIds;
    private java.math.BigDecimal totalReceived;
}
