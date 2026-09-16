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
public class IssueClosedEmailDTO {
    private String recipientEmail;
    private String employeeName;
    private String issueId;
    private String resolutionSummary;
    private String closedBy;
    private LocalDateTime closedDate;
    private String thankYouMessage;
}
