package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.SupplierRatingRequestDTO;
import com.infosys.procurement_system.dto.SupplierRatingResponseDTO;
import com.infosys.procurement_system.dto.SupplierRatingSummaryDTO;
import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.entity.SupplierRating;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.IllegalOperationException;
import com.infosys.procurement_system.exception.ResourceAlreadyReviewedException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.SupplierRatingMapper;
import com.infosys.procurement_system.repository.PurchaseOrderRepository;
import com.infosys.procurement_system.repository.SupplierRatingRepository;
import com.infosys.procurement_system.repository.SupplierRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.repository.ProductRepository;
import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierRatingService {

    private final SupplierRatingRepository supplierRatingRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRatingMapper supplierRatingMapper;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public SupplierRatingResponseDTO createRating(Long supplierId, SupplierRatingRequestDTO dto, User currentUser) {
        log.info("Submitting rating for supplier ID {} and order ID {} by user ID {}", supplierId, dto.getOrderId(), currentUser.getId());

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));

        PurchaseOrder order = purchaseOrderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", dto.getOrderId()));

        // Rule: The supplier must be the supplier associated with that order
        if (order.getSupplier() == null || !order.getSupplier().getId().equals(supplierId)) {
            throw new IllegalOperationException("Order ID " + dto.getOrderId() + " is not associated with supplier ID " + supplierId);
        }

        // Rule: The user must be associated with that order
        if (order.getIssue() == null || order.getIssue().getCreatedBy() == null || !order.getIssue().getCreatedBy().getId().equals(currentUser.getId())) {
            throw new IllegalOperationException("User is not authorized to rate order ID " + dto.getOrderId() + " as they are not the requester");
        }

        // Rule: A rating can only be submitted after the order has been delivered/completed
        if (order.getDeliveryStatus() != DeliveryStatus.DELIVERED) {
            throw new IllegalOperationException("Rating can only be submitted after the order has been delivered. Current delivery status: " + order.getDeliveryStatus());
        }

        // Rule: A user can rate a particular order only once
        if (supplierRatingRepository.existsByPurchaseOrderId(dto.getOrderId())) {
            throw new ResourceAlreadyReviewedException("Purchase order ID " + dto.getOrderId() + " has already been rated");
        }

        SupplierRating ratingEntity = SupplierRating.builder()
                .supplier(supplier)
                .user(currentUser)
                .purchaseOrder(order)
                .productRating(dto.getProductRating())
                .serviceRating(dto.getServiceRating())
                .review(dto.getReview())
                .build();

        ratingEntity = supplierRatingRepository.save(ratingEntity);

        updateSupplierAggregateRating(supplier);
        updateProductAggregateRating(ratingEntity.getPurchaseOrder().getProduct());

        // Notify Supplier
        List<User> supplierUsers = userRepository.findBySupplierId(supplier.getId());
        for (User u : supplierUsers) {
            notificationService.createNotification(u, "New Feedback Received", "You have received a new rating of " + dto.getProductRating() + " stars for order " + order.getPoNumber() + ".");
            if (u.getEmail() != null) {
                // Assuming we can reuse PaymentEmailDTO or WelcomeEmailDTO or AdminNotificationDTO to send simple emails, 
                // but let's just use what's available or we can just send it using a dummy. Since we don't have a specific FeedbackEmailDTO,
                // I will skip EmailService call for feedback if DTO doesn't exist. Wait, I can use AdminNotificationDTO.
                com.infosys.procurement_system.email.dto.AdminNotificationDTO emailDto = new com.infosys.procurement_system.email.dto.AdminNotificationDTO();
                emailDto.setAdminEmail(u.getEmail());
                emailDto.setNotificationType("PROCUREMENT");
                emailDto.setSubject("New Supplier Rating: " + dto.getProductRating() + " stars");
                emailService.sendAdminIssueNotification(emailDto);
            }
        }

        return supplierRatingMapper.toDto(ratingEntity);
    }

    @Transactional(readOnly = true)
    public List<SupplierRatingResponseDTO> getRatingsForSupplier(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier", "id", supplierId);
        }
        return supplierRatingRepository.findBySupplierIdOrderByCreatedAtDesc(supplierId).stream()
                .map(supplierRatingMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public SupplierRatingSummaryDTO getSupplierRatingSummary(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier", "id", supplierId);
        }

        Long totalRatings = supplierRatingRepository.countBySupplierId(supplierId);
        
        Double avgProd = supplierRatingRepository.findAverageProductRatingBySupplierId(supplierId);
        double averageProductRating = (avgProd != null && totalRatings > 0)
                ? BigDecimal.valueOf(avgProd).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        Double avgServ = supplierRatingRepository.findAverageServiceRatingBySupplierId(supplierId);
        double averageServiceRating = (avgServ != null && totalRatings > 0)
                ? BigDecimal.valueOf(avgServ).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        return SupplierRatingSummaryDTO.builder()
                .supplierId(supplierId)
                .averageProductRating(averageProductRating)
                .averageServiceRating(averageServiceRating)
                .totalRatings(totalRatings)
                .ratingDistribution(new LinkedHashMap<>())
                .build();
    }

    @Transactional
    public SupplierRatingResponseDTO updateRating(Long supplierId, Long ratingId, SupplierRatingRequestDTO dto, User currentUser) {
        SupplierRating ratingEntity = supplierRatingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierRating", "id", ratingId));

        if (!ratingEntity.getSupplier().getId().equals(supplierId)) {
            throw new IllegalOperationException("Rating ID " + ratingId + " does not belong to supplier ID " + supplierId);
        }

        if (!ratingEntity.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to update another user's rating");
        }

        ratingEntity.setProductRating(dto.getProductRating());
        ratingEntity.setServiceRating(dto.getServiceRating());
        ratingEntity.setReview(dto.getReview());
        ratingEntity = supplierRatingRepository.save(ratingEntity);

        updateSupplierAggregateRating(ratingEntity.getSupplier());
        updateProductAggregateRating(ratingEntity.getPurchaseOrder().getProduct());

        return supplierRatingMapper.toDto(ratingEntity);
    }

    @Transactional
    public void deleteRating(Long supplierId, Long ratingId, User currentUser) {
        SupplierRating ratingEntity = supplierRatingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("SupplierRating", "id", ratingId));

        if (!ratingEntity.getSupplier().getId().equals(supplierId)) {
            throw new IllegalOperationException("Rating ID " + ratingId + " does not belong to supplier ID " + supplierId);
        }

        if (!ratingEntity.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You are not authorized to delete another user's rating");
        }

        Supplier supplier = ratingEntity.getSupplier();
        Product product = ratingEntity.getPurchaseOrder().getProduct();
        supplierRatingRepository.delete(ratingEntity);

        updateSupplierAggregateRating(supplier);
        updateProductAggregateRating(product);
    }

    private void updateSupplierAggregateRating(Supplier supplier) {
        Double avg = supplierRatingRepository.findAverageRatingBySupplierId(supplier.getId());
        if (avg == null) {
            supplier.setRating(0.0);
        } else {
            BigDecimal bd = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);
            supplier.setRating(bd.doubleValue());
        }
        supplierRepository.save(supplier);
    }

    private void updateProductAggregateRating(Product product) {
        if (product == null) return;
        Double avg = supplierRatingRepository.findAverageProductRatingByProductId(product.getId());
        Integer total = supplierRatingRepository.countRatingsByProductId(product.getId());
        if (avg == null) {
            product.setAverageRating(0.0);
        } else {
            BigDecimal bd = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);
            product.setAverageRating(bd.doubleValue());
        }
        product.setTotalRatings(total != null ? total : 0);
        productRepository.save(product);
    }
}
