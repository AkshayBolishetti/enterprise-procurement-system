package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {

    @NotBlank(message = "Employee ID is mandatory")
    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @NotBlank(message = "User name is mandatory")
    @Size(max = 100, message = "User name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, max = 255, message = "Password must be between 6 and 255 characters")
    private String password;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @NotNull(message = "Role is mandatory")
    private Role role;

    @NotNull(message = "User status is mandatory")
    private UserStatus status;

    @NotNull(message = "Department ID is mandatory")
    private Long departmentId;

    private String homeAddress;

    private String officeAddress;
}
