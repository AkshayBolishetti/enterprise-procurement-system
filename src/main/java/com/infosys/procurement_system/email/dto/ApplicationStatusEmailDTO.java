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
public class ApplicationStatusEmailDTO {
    private String recipientEmail;
    private String employeeName;
    private String requestId;
    private String productName;
    private String previousStatus;
    private String currentStatus;
    private LocalDateTime updatedTime;
    private String adminRemarks;
}
