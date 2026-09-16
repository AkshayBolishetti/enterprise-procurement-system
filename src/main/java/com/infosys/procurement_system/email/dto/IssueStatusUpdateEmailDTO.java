package com.infosys.procurement_system.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueStatusUpdateEmailDTO {
    private String recipientEmail;
    private String employeeName;
    private String issueId;
    private String previousStatus;
    private String newStatus;
    private String updatedBy;
    private LocalDateTime updatedTime;
    private String adminRemarks;
}
