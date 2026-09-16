package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.ProductStatus;
import com.infosys.procurement_system.enums.SupplierProductAvailability;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {

    @NotBlank(message = "SKU is mandatory")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    @NotBlank(message = "Product name is mandatory")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    private String productName;

    private String description;

    @NotBlank(message = "Category is mandatory")
    private String category;

    @NotNull(message = "Unit price is mandatory")
    @Positive(message = "Unit price must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Unit price format is invalid")
    private BigDecimal unitPrice;

    @NotNull(message = "GST Rate is mandatory")
    @Digits(integer = 5, fraction = 2, message = "GST Rate format is invalid")
    private BigDecimal gstRate;

    @NotNull(message = "Available Quantity is mandatory")
    private Integer availableQuantity;

    private Integer minOrderQuantity;

    private ProductStatus status;

    private SupplierProductAvailability availability;
}
