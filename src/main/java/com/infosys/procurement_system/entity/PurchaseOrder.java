package com.infosys.procurement_system.entity;

import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.PaymentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders", indexes = {
        @Index(name = "idx_po_number", columnList = "po_number"),
        @Index(name = "idx_po_product", columnList = "product_id"),
        @Index(name = "idx_po_issue", columnList = "issue_id"),
        @Index(name = "idx_po_payment_status", columnList = "payment_status"),
        @Index(name = "idx_po_delivery_status", columnList = "delivery_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "PO Number is mandatory")
    @Size(max = 50, message = "PO Number must not exceed 50 characters")
    @Column(name = "po_number", nullable = false, unique = true, length = 50)
    private String poNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @NotNull(message = "Quantity is mandatory")
    @Positive(message = "Quantity must be greater than zero")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull(message = "Subtotal is mandatory")
    @Positive(message = "Subtotal must be greater than zero")
    @Column(name = "subtotal", nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @NotNull(message = "GST Rate is mandatory")
    @Column(name = "gst_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal gstRate;

    @NotNull(message = "GST Amount is mandatory")
    @Column(name = "gst_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal gstAmount;

    @NotNull(message = "Total amount is mandatory")
    @Positive(message = "Total amount must be greater than zero")
    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Payment status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private PaymentStatus paymentStatus;

    @NotNull(message = "Delivery status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    private DeliveryStatus deliveryStatus;

    @Column(name = "expected_delivery_date")
    private LocalDateTime expectedDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDateTime actualDeliveryDate;
    
    @Column(name = "carrier_name")
    private String carrierName;
    
    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "stock_deducted", nullable = false)
    @Builder.Default
    private Boolean stockDeducted = false;
}
