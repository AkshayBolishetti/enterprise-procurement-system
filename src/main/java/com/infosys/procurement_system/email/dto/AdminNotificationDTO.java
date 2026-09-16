package com.infosys.procurement_system.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationDTO {
    private String adminEmail;
    private String notificationType; // ISSUE, PROCUREMENT, EMPLOYEE_ACCOUNT
    private String employeeName;
    private String employeeEmail;
    private String employeeId;
    private String department;
    
    // Issue specific fields
    private String issueId;
    private String subject;
    private String priority;
    private String category;
    
    // Procurement specific fields
    private String requestId;
    private String requestedProduct;
    private Integer quantity;
    private BigDecimal budget;

    // Account specific fields
    private String role;

    private LocalDateTime createdTime;
}
