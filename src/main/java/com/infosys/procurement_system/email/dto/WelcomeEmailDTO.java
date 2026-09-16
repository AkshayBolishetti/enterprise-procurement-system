package com.infosys.procurement_system.email.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WelcomeEmailDTO {
    private String recipientEmail;
    private String employeeName;
    private String employeeId;
    private String department;
    private String designation;
    private String role;
}
