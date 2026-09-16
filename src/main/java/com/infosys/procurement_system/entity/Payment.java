package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_txn_id", columnList = "txn_id"),
        @Index(name = "idx_payment_order_id", columnList = "purchase_order_id"),
        @Index(name = "idx_payment_supplier_id", columnList = "supplier_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "Transaction ID is mandatory")
    @Size(max = 100, message = "Transaction ID must not exceed 100 characters")
    @Column(name = "txn_id", nullable = false, unique = true, length = 100)
    private String txnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    @NotNull(message = "Payment amount is mandatory")
    @Positive(message = "Payment amount must be greater than zero")
    @Digits(integer = 12, fraction = 2, message = "Amount format is invalid")
    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Payment method is mandatory")
    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod; // UPI or QR

    @NotNull(message = "Payment status is mandatory")
    @Column(name = "status", nullable = false, length = 30)
    private String status; // SUCCESS

}
