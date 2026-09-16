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
public class IssueEmailDTO {
    private String recipientEmail;
    private String employeeName;
    private String issueId;
    private String issueSubject;
    private String description;
    private String priority;
    private String department;
    private LocalDateTime createdDateTime;
    private String currentStatus;
    private String confirmationMessage;
}
