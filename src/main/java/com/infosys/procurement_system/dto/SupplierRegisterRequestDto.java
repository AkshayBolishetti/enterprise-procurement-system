package com.infosys.procurement_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRegisterRequestDto {

    @NotBlank(message = "Supplier ID is mandatory")
    @Size(max = 50, message = "Supplier ID must not exceed 50 characters")
    private String supplierId;

    @NotBlank(message = "Supplier Name is mandatory")
    @Size(max = 100, message = "Supplier Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;
}
