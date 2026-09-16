package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.SupplierDTO;
import com.infosys.procurement_system.entity.Category;
import com.infosys.procurement_system.entity.Supplier;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class SupplierMapper {

    public SupplierDTO toDto(Supplier entity) {
        if (entity == null) {
            return null;
        }
        return SupplierDTO.builder()
                .id(entity.getId())
                .supplierName(entity.getSupplierName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .gstNumber(entity.getGstNumber())
                .active(entity.getActive())
                .rating(entity.getRating())
                .categoryIds(entity.getCategories() != null ? 
                    entity.getCategories().stream().map(Category::getId).collect(Collectors.toList()) : null)
                .totalReceived(entity.getTotalReceived())
                .build();
    }
}
