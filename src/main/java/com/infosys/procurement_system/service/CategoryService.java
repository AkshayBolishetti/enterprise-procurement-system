package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.CategoryRequestDTO;
import com.infosys.procurement_system.dto.CategoryResponseDTO;
import com.infosys.procurement_system.email.event.ApprovalRequiredEvent;
import com.infosys.procurement_system.entity.Category;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.IllegalOperationException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.CategoryMapper;
import com.infosys.procurement_system.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO requestDTO) {
        log.info("Creating category: {}", requestDTO.getCategoryName());
        if (categoryRepository.existsByCategoryName(requestDTO.getCategoryName())) {
            throw new DuplicateResourceException("Category", "categoryName", requestDTO.getCategoryName());
        }
        Category saved = categoryRepository.save(categoryMapper.toEntity(requestDTO));
        eventPublisher.publishEvent(ApprovalRequiredEvent.builder()
                .entityType("Category Approval")
                .entityId(String.valueOf(saved.getId()))
                .entityName(saved.getCategoryName())
                .details("Category Name: " + saved.getCategoryName())
                .build());
        return categoryMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(categoryMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO requestDTO) {
        log.info("Updating category ID: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (categoryRepository.existsByCategoryNameAndIdNot(requestDTO.getCategoryName(), id)) {
            throw new DuplicateResourceException("Category", "categoryName", requestDTO.getCategoryName());
        }

        categoryMapper.updateEntityFromDto(requestDTO, category);
        return categoryMapper.toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        throw new IllegalOperationException("Category is system master data and cannot be deleted.");
    }
}
