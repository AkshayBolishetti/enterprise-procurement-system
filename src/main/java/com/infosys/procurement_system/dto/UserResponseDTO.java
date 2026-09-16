package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
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
public class UserResponseDTO {

    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private String phoneNumber;
    private String designation;
    private Role role;
    private UserStatus status;
    private Long departmentId;
    private String departmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String homeAddress;
    private String officeAddress;
}
