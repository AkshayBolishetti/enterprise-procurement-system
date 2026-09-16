package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.SupplierDTO;
import com.infosys.procurement_system.entity.Category;
import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.SupplierMapper;
import com.infosys.procurement_system.repository.CategoryRepository;
import com.infosys.procurement_system.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository supplierRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierMapper supplierMapper;

    @Transactional(readOnly = true)
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(supplierMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierDTO getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return supplierMapper.toDto(supplier);
    }

    @Transactional
    public SupplierDTO createSupplier(SupplierDTO dto) {
        Supplier supplier = Supplier.builder()
                .supplierName(dto.getSupplierName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .gstNumber(dto.getGstNumber())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .rating(dto.getRating() != null ? dto.getRating() : 0.0)
                .build();
        
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
            supplier.setCategories(categories);
        }

        return supplierMapper.toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public SupplierDTO updateSupplier(Long id, SupplierDTO dto) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        supplier.setSupplierName(dto.getSupplierName());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setGstNumber(dto.getGstNumber());
        if (dto.getActive() != null) supplier.setActive(dto.getActive());
        if (dto.getRating() != null) supplier.setRating(dto.getRating());

        if (dto.getCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(dto.getCategoryIds());
            supplier.setCategories(categories);
        }

        return supplierMapper.toDto(supplierRepository.save(supplier));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new ResourceNotFoundException("Supplier", "id", id);
        }
        supplierRepository.deleteById(id);
    }
}
