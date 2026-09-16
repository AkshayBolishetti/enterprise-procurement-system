package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.enums.IssueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueResponseDTO {

    private Long id;
    private String issueNumber;
    private String title;
    private String description;
    private IssuePriority priority;
    private Integer requestedQuantity;
    private String category;
    private IssueStatus status;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String departmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<IssueApprovalStepDTO> approvalSteps;
    private PurchaseOrderResponseDTO purchaseOrder;
    private Long productId;
    private String productName;
    private String deliveryAddress;
    private java.math.BigDecimal totalPrice;
}
