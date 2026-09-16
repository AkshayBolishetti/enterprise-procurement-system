package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private Long id;
    private String employeeId;
    private String name;
    private String email;
    private Role role;
    private UserStatus status;
    private String departmentName;
    private String message;
    private String token;
}
