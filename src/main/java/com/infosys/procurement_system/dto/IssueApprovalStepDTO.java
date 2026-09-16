package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.ApprovalRole;
import com.infosys.procurement_system.enums.IssueStatus;
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
public class IssueApprovalStepDTO {
    private Long id;
    private Long approverId;
    private String approverName;
    private ApprovalRole approvalRole;
    private IssueStatus status;
    private String remarks;
    private LocalDateTime timestamp;
}
