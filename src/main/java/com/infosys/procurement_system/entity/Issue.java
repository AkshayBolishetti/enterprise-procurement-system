package com.infosys.procurement_system.entity;

import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.enums.IssueStatus;
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
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;

@Entity
@Table(name = "issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Issue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Issue number is mandatory")
    @Size(max = 50, message = "Issue number must not exceed 50 characters")
    @Column(name = "issue_number", nullable = false, unique = true, length = 50)
    private String issueNumber;

    @NotBlank(message = "Title is mandatory")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @NotBlank(message = "Description is mandatory")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Priority is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private IssuePriority priority;

    @NotNull(message = "Status is mandatory")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private IssueStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_id")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @NotNull(message = "Requested quantity is mandatory")
    @Positive(message = "Requested quantity must be greater than zero")
    @Column(name = "requested_quantity", nullable = false)
    @Builder.Default
    private Integer requestedQuantity = 1;

    @Column(name = "category_name")
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "total_price", precision = 14, scale = 2)
    private java.math.BigDecimal totalPrice;

    @OneToOne(mappedBy = "issue", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private PurchaseOrder purchaseOrder;

    @Builder.Default
    @OneToMany(mappedBy = "issue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<IssueApprovalStep> approvalSteps = new ArrayList<>();
}
