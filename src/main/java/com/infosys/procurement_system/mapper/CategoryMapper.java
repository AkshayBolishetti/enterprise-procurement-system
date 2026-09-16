package com.infosys.procurement_system.mapper;

import com.infosys.procurement_system.dto.CategoryRequestDTO;
import com.infosys.procurement_system.dto.CategoryResponseDTO;
import com.infosys.procurement_system.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public Category toEntity(CategoryRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        return Category.builder()
                .categoryName(dto.getCategoryName())
                .build();
    }

    public CategoryResponseDTO toDto(Category entity) {
        if (entity == null) {
            return null;
        }
        return CategoryResponseDTO.builder()
                .id(entity.getId())
                .categoryName(entity.getCategoryName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntityFromDto(CategoryRequestDTO dto, Category entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setCategoryName(dto.getCategoryName());
    }
}
