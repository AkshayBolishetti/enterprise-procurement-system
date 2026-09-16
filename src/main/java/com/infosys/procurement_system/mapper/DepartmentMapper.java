package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.DepartmentRequestDTO;
import com.infosys.procurement_system.dto.DepartmentResponseDTO;
import com.infosys.procurement_system.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return Department.builder()
                .departmentName(dto.getDepartmentName())
                .build();
    }

    public DepartmentResponseDTO toDto(Department entity) {
        if (entity == null) {
            return null;
        }
        return DepartmentResponseDTO.builder()
                .id(entity.getId())
                .departmentName(entity.getDepartmentName())
                .adminId(entity.getAdmin() != null ? entity.getAdmin().getId() : null)
                .adminName(entity.getAdmin() != null ? entity.getAdmin().getName() : null)
                .adminEmail(entity.getAdmin() != null ? entity.getAdmin().getEmail() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromDto(DepartmentRequestDTO dto, Department entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setDepartmentName(dto.getDepartmentName());
    }
}
