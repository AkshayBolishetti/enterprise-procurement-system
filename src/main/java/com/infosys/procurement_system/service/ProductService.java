package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.ProductRequestDTO;
import com.infosys.procurement_system.dto.ProductResponseDTO;
import com.infosys.procurement_system.enums.SupplierProductAvailability;
import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.ProductMapper;
import com.infosys.procurement_system.repository.ProductRepository;
import com.infosys.procurement_system.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO requestDTO, User currentUser) {
        log.info("Supplier creating product SKU: {}", requestDTO.getSku());
        
        if (currentUser.getSupplier() == null) {
            throw new IllegalStateException("Current user is not associated with a supplier.");
        }
        
        Supplier supplier = supplierRepository.findById(currentUser.getSupplier().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", currentUser.getSupplier().getId()));

        if (productRepository.existsBySku(requestDTO.getSku())) {
            throw new DuplicateResourceException("Product", "sku", requestDTO.getSku());
        }

        Product saved = productRepository.save(productMapper.toEntity(requestDTO, supplier));
        return productMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getMyProducts(User currentUser) {
        if (currentUser.getSupplier() == null) {
            return List.of();
        }
        return productRepository.findBySupplierId(currentUser.getSupplier().getId()).stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO requestDTO, User currentUser) {
        log.info("Updating product ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (currentUser.getSupplier() == null || !product.getSupplier().getId().equals(currentUser.getSupplier().getId())) {
            throw new IllegalStateException("You do not have permission to update this product.");
        }

        if (productRepository.existsBySkuAndIdNot(requestDTO.getSku(), id)) {
            throw new DuplicateResourceException("Product", "sku", requestDTO.getSku());
        }

        productMapper.updateEntityFromDto(requestDTO, product, product.getSupplier());
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    @Transactional
    public ProductResponseDTO updateProductAvailability(Long id, SupplierProductAvailability availability, User currentUser) {
        log.info("Updating product availability ID: {} to {}", id, availability);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (currentUser.getSupplier() == null || !product.getSupplier().getId().equals(currentUser.getSupplier().getId())) {
            throw new IllegalStateException("You do not have permission to update this product's availability.");
        }

        product.setAvailability(availability);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    @Transactional
    public void deleteProduct(Long id, User currentUser) {
        log.info("Deleting product ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (currentUser.getSupplier() == null || !product.getSupplier().getId().equals(currentUser.getSupplier().getId())) {
            throw new IllegalStateException("You do not have permission to delete this product.");
        }

        productRepository.delete(product);
    }
}
