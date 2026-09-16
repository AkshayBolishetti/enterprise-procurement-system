package com.infosys.procurement_system.dto;

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
public class DepartmentResponseDTO {

    private Long id;
    private String departmentName;
    private Long adminId;
    private String adminName;
    private String adminEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
