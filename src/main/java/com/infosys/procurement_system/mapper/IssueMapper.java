package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.IssueRequestDTO;
import com.infosys.procurement_system.dto.IssueResponseDTO;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.enums.IssueStatus;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.List;
import com.infosys.procurement_system.dto.IssueApprovalStepDTO;

@Component
public class IssueMapper {

    @org.springframework.beans.factory.annotation.Autowired
    private PurchaseOrderMapper purchaseOrderMapper;

    public Issue toEntity(IssueRequestDTO dto, String issueNumber, User createdBy) {
        if (dto == null) {
            return null;
        }
        return Issue.builder()
                .issueNumber(issueNumber)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : IssuePriority.MEDIUM)
                .requestedQuantity(dto.getRequestedQuantity() != null ? dto.getRequestedQuantity() : 1)
                .category(dto.getCategory())
                .status(IssueStatus.OPEN)
                .createdBy(createdBy)
                .build();
    }

    public IssueResponseDTO toDto(Issue entity) {
        if (entity == null) {
            return null;
        }

        return IssueResponseDTO.builder()
                .id(entity.getId())
                .issueNumber(entity.getIssueNumber())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .requestedQuantity(entity.getRequestedQuantity())
                .category(entity.getCategory())
                .status(entity.getStatus())
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getName() : null)
                .createdByEmail(entity.getCreatedBy() != null ? entity.getCreatedBy().getEmail() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .resolvedAt(entity.getResolvedAt())
                .approvalSteps(entity.getApprovalSteps() != null ? 
                    entity.getApprovalSteps().stream().map(step -> IssueApprovalStepDTO.builder()
                        .id(step.getId())
                        .approverId(step.getApprover() != null ? step.getApprover().getId() : null)
                        .approverName(step.getApprover() != null ? step.getApprover().getName() : null)
                        .approvalRole(step.getApprovalRole())
                        .status(step.getStatus())
                        .remarks(step.getRemarks())
                        .timestamp(step.getTimestamp())
                        .build()).collect(Collectors.toList()) 
                    : List.of())
                .purchaseOrder(purchaseOrderMapper.toDto(entity.getPurchaseOrder()))
                .build();
    }
}
