package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.PurchaseOrderResponseDTO;
import com.infosys.procurement_system.entity.*;
import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.IssueStatus;
import com.infosys.procurement_system.enums.PaymentStatus;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.repository.*;
import com.infosys.procurement_system.email.EmailService;
import com.infosys.procurement_system.email.dto.PaymentEmailDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final IssueRepository issueRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final com.infosys.procurement_system.repository.SupplierRatingRepository supplierRatingRepository;

    @Transactional(readOnly = true)
    public List<PurchaseOrderResponseDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PurchaseOrderResponseDTO createPurchaseOrder(Long issueId, Long productId, Integer quantity,
            Long supplierId) {
        // Check if PO already exists for this issue
        if (purchaseOrderRepository.findByIssueId(issueId).isPresent()) {
            throw new DuplicateResourceException("PurchaseOrder", "issueId", issueId);
        }

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        Supplier supplier = null;
        if (supplierId != null) {
            supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        } else if (product.getSupplier() != null) {
            supplier = product.getSupplier();
        }

        int qty = quantity != null ? quantity
                : (issue.getRequestedQuantity() != null ? issue.getRequestedQuantity() : 1);
        BigDecimal subtotal = product.getUnitPrice().multiply(BigDecimal.valueOf(qty));
        BigDecimal gstRate = product.getGstRate() != null ? product.getGstRate() : BigDecimal.ZERO;
        BigDecimal gstAmount = subtotal.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(gstAmount);

        String poNumber = "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .issue(issue)
                .product(product)
                .supplier(supplier)
                .quantity(qty)
                .subtotal(subtotal)
                .gstRate(gstRate)
                .gstAmount(gstAmount)
                .totalAmount(totalAmount)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryStatus(DeliveryStatus.PROCESSING)
                .build();

        PurchaseOrder saved = purchaseOrderRepository.save(po);

        // Update issue status
        issue.setStatus(IssueStatus.PAYMENT_PENDING);
        issueRepository.save(issue);

        log.info("Purchase Order {} created for issue {}", saved.getPoNumber(), issue.getIssueNumber());
        return toDto(saved);
    }

    @Transactional
    public Map<String, Object> processSimulatedPayment(Long issueId, Long productId, Integer quantity, Map<String, Object> paymentData, User adminUser) {
        String paymentMethod = (String) paymentData.get("paymentMethod");
        
        // Validation
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
                
        if (issue.getStatus() != IssueStatus.APPROVED && issue.getStatus() != IssueStatus.PAYMENT_PENDING && issue.getStatus() != IssueStatus.PAID) {
            throw new IllegalArgumentException("This Request is not eligible for payment.");
        }
        
        java.util.Optional<PurchaseOrder> existingPoOpt = purchaseOrderRepository.findByIssueId(issueId);
        if (existingPoOpt.isPresent()) {
            PurchaseOrder existingPo = existingPoOpt.get();
            if (existingPo.getPaymentStatus() == PaymentStatus.PAID) {
                java.util.Optional<Payment> existingPaymentOpt = paymentRepository.findByOrder_IdAndStatus(existingPo.getId(), "PAID");
                if (existingPaymentOpt.isPresent()) {
                    Payment existingPayment = existingPaymentOpt.get();
                    log.info("Returning existing payment for PO {} - TXN: {}", existingPo.getPoNumber(), existingPayment.getTxnId());
                    return Map.of(
                            "txnId", existingPayment.getTxnId(),
                            "poNumber", existingPo.getPoNumber(),
                            "amount", existingPayment.getAmount(),
                            "status", "SUCCESS",
                            "message", "Payment was already processed successfully"
                    );
                }
            }
            throw new IllegalArgumentException("Purchase Order exists but is not completely PAID or in a valid state.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
                
        Supplier supplier = product.getSupplier();

        // Authenticate - All modes are SIMULATED and require NO real validation
        if ("QR".equals(paymentMethod)) {
            // Simulated Success
        } else if ("CARD".equals(paymentMethod)) {
            // Simulated Success
        } else if ("NET_BANKING".equals(paymentMethod)) {
            // Simulated Success
        } else {
            throw new IllegalArgumentException("Unsupported payment method");
        }
        
        int qty = quantity != null ? quantity : (issue.getRequestedQuantity() != null ? issue.getRequestedQuantity() : 1);
        BigDecimal subtotal = product.getUnitPrice().multiply(BigDecimal.valueOf(qty));
        BigDecimal gstRate = product.getGstRate() != null ? product.getGstRate() : BigDecimal.ZERO;
        BigDecimal gstAmount = subtotal.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(gstAmount);

        String poNumber = "PO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .issue(issue)
                .product(product)
                .supplier(supplier)
                .quantity(qty)
                .subtotal(subtotal)
                .gstRate(gstRate)
                .gstAmount(gstAmount)
                .totalAmount(totalAmount)
                .paymentStatus(PaymentStatus.PAID)
                .deliveryStatus(DeliveryStatus.PROCESSING)
                .build();
        PurchaseOrder savedPo;
        try {
            savedPo = purchaseOrderRepository.save(po);
            purchaseOrderRepository.flush(); // Force flush to catch constraint violation immediately
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.warn("Concurrent duplicate payment request intercepted for PO creation: {}", issueId);
            throw new DuplicateResourceException("PurchaseOrder", "issueId", issueId);
        }

        issue.setStatus(IssueStatus.PAID); // Or COMPLETED depending on business rule, but let's stick to PAID
        issueRepository.save(issue);

        BigDecimal currentReceived = supplier.getTotalReceived() != null ? supplier.getTotalReceived() : BigDecimal.ZERO;
        supplier.setTotalReceived(currentReceived.add(totalAmount));
        supplierRepository.save(supplier);

        String txnId = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        
        Payment payment = Payment.builder()
                .txnId(txnId)
                .order(savedPo)
                .admin(adminUser)
                .supplier(supplier)
                .amount(totalAmount)
                .paymentMethod(paymentMethod)
                .status("PAID")
                .build();
        paymentRepository.save(payment);

        // Notify Supplier
        List<User> supplierUsers = userRepository.findBySupplierId(supplier.getId());
        for (User u : supplierUsers) {
            notificationService.createNotification(u, "New Order Received", "You have received a new order " + poNumber + " for " + product.getProductName() + ".");
            if (u.getEmail() != null) {
                PaymentEmailDTO emailDto = PaymentEmailDTO.builder()
                        .recipientEmail(u.getEmail())
                        .recipientName(u.getName())
                        .poNumber(poNumber)
                        .purchaseOrderId(savedPo.getId())
                        .productName(product.getProductName())
                        .quantity(qty)
                        .totalAmount(totalAmount)
                        .supplierName(supplier.getSupplierName())
                        .build();
                emailService.sendSupplierNewOrderEmail(emailDto);
            }
        }

        log.info("Simulated Payment processed for PO {} - TXN: {}", po.getPoNumber(), txnId);

        return Map.of(
                "txnId", txnId,
                "poNumber", po.getPoNumber(),
                "amount", totalAmount,
                "status", "SUCCESS"
        );
    }

    private PurchaseOrderResponseDTO toDto(PurchaseOrder po) {
        PurchaseOrderResponseDTO.PurchaseOrderResponseDTOBuilder builder = PurchaseOrderResponseDTO.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .quantity(po.getQuantity())
                .totalAmount(po.getTotalAmount())
                .paymentStatus(po.getPaymentStatus())
                .deliveryStatus(po.getDeliveryStatus())
                .carrierName(po.getCarrierName())
                .trackingNumber(po.getTrackingNumber())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .actualDeliveryDate(po.getActualDeliveryDate())
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .isRated(supplierRatingRepository.existsByPurchaseOrderId(po.getId()));

        if (po.getProduct() != null) {
            builder.productCode(po.getProduct().getProductCode())
                    .productName(po.getProduct().getProductName());
        }

        if (po.getIssue() != null) {
            builder.requestId(po.getIssue().getId());
            if (po.getIssue().getCreatedBy() != null) {
                builder.requestedById(po.getIssue().getCreatedBy().getId())
                        .requestedByName(po.getIssue().getCreatedBy().getName())
                        .requestedByEmail(po.getIssue().getCreatedBy().getEmail());
            }
        }

        if (po.getSupplier() != null) {
            builder.supplierId(po.getSupplier().getId())
                    .supplierName(po.getSupplier().getSupplierName());
        }

        return builder.build();
    }
    
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponseDTO> getOrdersForSupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PurchaseOrderResponseDTO> getMyOrders(User user) {
        return purchaseOrderRepository.findByIssue_CreatedById(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void dispatchPurchaseOrder(Long poId, String carrierName, String trackingNumber, User supplierUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));
        
        if (supplierUser.getSupplier() == null || !po.getSupplier().getId().equals(supplierUser.getSupplier().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to dispatch this order.");
        }

        if (po.getDeliveryStatus() != DeliveryStatus.PACKED) {
            throw new IllegalArgumentException("Order must be PACKED before it can be dispatched.");
        }

        po.setDeliveryStatus(DeliveryStatus.SHIPPED);
        po.setCarrierName(carrierName);
        po.setTrackingNumber(trackingNumber);
        
        purchaseOrderRepository.save(po);

        if (po.getIssue().getCreatedBy() != null) {
            notificationService.createNotification(po.getIssue().getCreatedBy(), 
                    "Order Shipped", 
                    "Order " + po.getPoNumber() + " has been dispatched via " + carrierName + ".");
        }
    }
    
    @Transactional
    public PurchaseOrderResponseDTO updateOrderStatus(Long poId, DeliveryStatus newStatus, User supplierUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));

        if (supplierUser.getSupplier() == null || !po.getSupplier().getId().equals(supplierUser.getSupplier().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to update this order.");
        }

        DeliveryStatus currentStatus = po.getDeliveryStatus();
        boolean validTransition = false;

        switch (currentStatus) {
            case PROCESSING:
                validTransition = (newStatus == DeliveryStatus.ACCEPTED);
                break;
            case ACCEPTED:
                validTransition = (newStatus == DeliveryStatus.PACKED);
                break;
            case PACKED:
                // Frontend should ideally use /dispatch, but we allow it here
                validTransition = (newStatus == DeliveryStatus.SHIPPED);
                break;
            case SHIPPED:
                validTransition = (newStatus == DeliveryStatus.NEAR_HUB);
                break;
            case NEAR_HUB:
                validTransition = (newStatus == DeliveryStatus.OUT_FOR_DELIVERY);
                break;
            case OUT_FOR_DELIVERY:
                validTransition = (newStatus == DeliveryStatus.DELIVERED);
                break;
            case DELIVERED:
                validTransition = false;
                break;
        }

        if (!validTransition) {
            throw new IllegalArgumentException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        po.setDeliveryStatus(newStatus);

        // Stock deduction on PACKED transition — exactly once
        if (newStatus == DeliveryStatus.PACKED && !Boolean.TRUE.equals(po.getStockDeducted())) {
            Product product = productRepository.findByIdForUpdate(po.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", po.getProduct().getId()));
            int newStock = product.getAvailableQuantity() - po.getQuantity();
            if (newStock < 0) {
                throw new IllegalArgumentException("Insufficient stock to pack this order. Available: " 
                        + product.getAvailableQuantity() + ", Required: " + po.getQuantity());
            }
            product.setAvailableQuantity(newStock);
            productRepository.save(product);
            po.setStockDeducted(true);
        }
        
        if (newStatus == DeliveryStatus.DELIVERED) {
             po.setActualDeliveryDate(java.time.LocalDateTime.now());
             po.getIssue().setStatus(IssueStatus.COMPLETED);
             issueRepository.save(po.getIssue());
        }
        
        purchaseOrderRepository.save(po);

        if (po.getIssue().getCreatedBy() != null) {
            notificationService.createNotification(po.getIssue().getCreatedBy(), 
                    "Order Status Updated", 
                    "Order " + po.getPoNumber() + " is now " + newStatus.name().replace("_", " ") + ".");
        }

        return toDto(po);
    }
}
