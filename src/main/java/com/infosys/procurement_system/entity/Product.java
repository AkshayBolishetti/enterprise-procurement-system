package com.infosys.procurement_system.entity;

import com.infosys.procurement_system.enums.ProductStatus;
import com.infosys.procurement_system.enums.SupplierProductAvailability;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Product code is mandatory")
    @Size(max = 50, message = "Product code must not exceed 50 characters")
    @Column(name = "product_code", nullable = false, unique = true, length = 50)
    private String productCode;

    @NotBlank(message = "Product name is mandatory")
    @Size(max = 150, message = "Product name must not exceed 150 characters")
    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "SKU is mandatory")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    @Column(name = "sku", nullable = false, unique = true, length = 50)
    private String sku;

    @NotNull(message = "Unit price is mandatory")
    @Positive(message = "Unit price must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Unit price format is invalid")
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @NotNull(message = "GST Rate is mandatory")
    @Digits(integer = 5, fraction = 2, message = "GST Rate format is invalid")
    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;

    @NotNull(message = "Available Quantity is mandatory")
    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(name = "min_order_quantity")
    private Integer minOrderQuantity;

    @NotNull(message = "Product status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "availability", nullable = false, length = 20)
    @Builder.Default
    private SupplierProductAvailability availability = SupplierProductAvailability.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @NotBlank(message = "Category is mandatory")
    @Column(name = "category_name", nullable = false)
    private String category;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "total_ratings")
    private Integer totalRatings;
}
