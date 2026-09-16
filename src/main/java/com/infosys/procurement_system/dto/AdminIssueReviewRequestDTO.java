package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.IssueStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminIssueReviewRequestDTO {

    private IssueStatus status;
    private String reason;
    private String remarks;
    private Long productId;
    private Integer assignedQuantity;
}
