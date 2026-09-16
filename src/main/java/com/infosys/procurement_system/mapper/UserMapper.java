package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.UserRequestDTO;
import com.infosys.procurement_system.dto.UserResponseDTO;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRequestDTO dto, Department department) {
        if (dto == null) {
            return null;
        }
        return User.builder()
                .employeeId(dto.getEmployeeId())
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .phoneNumber(dto.getPhoneNumber())
                .designation(dto.getDesignation())
                .role(dto.getRole())
                .status(dto.getStatus())
                .department(department)
                .homeAddress(dto.getHomeAddress())
                .officeAddress(dto.getOfficeAddress())
                .build();
    }

    public UserResponseDTO toDto(User entity) {
        if (entity == null) {
            return null;
        }
        return UserResponseDTO.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployeeId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phoneNumber(entity.getPhoneNumber())
                .designation(entity.getDesignation())
                .role(entity.getRole())
                .status(entity.getStatus())
                .departmentId(entity.getDepartment() != null ? entity.getDepartment().getId() : null)
                .departmentName(entity.getDepartment() != null ? entity.getDepartment().getDepartmentName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .homeAddress(entity.getHomeAddress())
                .officeAddress(entity.getOfficeAddress())
                .build();
    }

    public void updateEntityFromDto(UserRequestDTO dto, User entity, Department department) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setEmployeeId(dto.getEmployeeId());
        entity.setName(dto.getName());
        entity.setEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            entity.setPassword(dto.getPassword());
        }
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setDesignation(dto.getDesignation());
        entity.setRole(dto.getRole());
        entity.setStatus(dto.getStatus());
        entity.setDepartment(department);
        entity.setHomeAddress(dto.getHomeAddress());
        entity.setOfficeAddress(dto.getOfficeAddress());
    }
}
