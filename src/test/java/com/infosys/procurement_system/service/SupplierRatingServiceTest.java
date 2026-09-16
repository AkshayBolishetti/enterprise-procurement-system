package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.SupplierRatingRequestDTO;
import com.infosys.procurement_system.dto.SupplierRatingResponseDTO;
import com.infosys.procurement_system.dto.SupplierRatingSummaryDTO;
import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.entity.SupplierRating;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.enums.DeliveryStatus;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.IllegalOperationException;
import com.infosys.procurement_system.exception.ResourceAlreadyReviewedException;
import com.infosys.procurement_system.mapper.SupplierRatingMapper;
import com.infosys.procurement_system.repository.PurchaseOrderRepository;
import com.infosys.procurement_system.repository.SupplierRatingRepository;
import com.infosys.procurement_system.repository.SupplierRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.repository.ProductRepository;
import com.infosys.procurement_system.email.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierRatingServiceTest {

        @Mock
        private SupplierRatingRepository supplierRatingRepository;

        @Mock
        private SupplierRepository supplierRepository;

        @Mock
        private PurchaseOrderRepository purchaseOrderRepository;

        @Mock
        private SupplierRatingMapper supplierRatingMapper;

        @Mock
        private NotificationService notificationService;

        @Mock
        private EmailService emailService;

        @Mock
        private UserRepository userRepository;

        @Mock
        private ProductRepository productRepository;

        @InjectMocks
        private SupplierRatingService supplierRatingService;

        private User employeeUser;
        private User otherUser;
        private Supplier supplier;
        private Supplier otherSupplier;
        private PurchaseOrder deliveredOrder;
        private PurchaseOrder pendingOrder;

        @BeforeEach
        void setUp() {
                employeeUser = User.builder().id(10L).name("Jane Employee").email("jane@test.com").role(Role.EMPLOYEE)
                                .build();
                otherUser = User.builder().id(20L).name("Other Employee").email("other@test.com").role(Role.EMPLOYEE)
                                .build();

                supplier = Supplier.builder().id(100L).supplierName("Tech Corp").rating(4.5).build();
                otherSupplier = Supplier.builder().id(200L).supplierName("Other Corp").rating(4.0).build();

                Issue issue = Issue.builder().id(1L).createdBy(employeeUser).build();

                Product product = Product.builder().id(50L).productName("Test Product").build();

                deliveredOrder = PurchaseOrder.builder()
                                .id(123L)
                                .poNumber("PO-1001")
                                .issue(issue)
                                .supplier(supplier)
                                .product(product)
                                .deliveryStatus(DeliveryStatus.DELIVERED)
                                .build();

                pendingOrder = PurchaseOrder.builder()
                                .id(124L)
                                .poNumber("PO-1002")
                                .issue(issue)
                                .supplier(supplier)
                                .deliveryStatus(DeliveryStatus.PROCESSING)
                                .build();
        }

        @Test
        void testCreateRating_Success() {
                SupplierRatingRequestDTO requestDTO = SupplierRatingRequestDTO.builder()
                                .orderId(123L)
                                .productRating(5)
                                .serviceRating(4)
                                .review("Fast delivery and good quality.")
                                .build();

                when(supplierRepository.findById(100L)).thenReturn(Optional.of(supplier));
                when(purchaseOrderRepository.findById(123L)).thenReturn(Optional.of(deliveredOrder));
                when(supplierRatingRepository.existsByPurchaseOrderId(123L)).thenReturn(false);

                SupplierRating savedRating = SupplierRating.builder()
                                .id(1L)
                                .supplier(supplier)
                                .user(employeeUser)
                                .purchaseOrder(deliveredOrder)
                                .productRating(5)
                                .serviceRating(4)
                                .review("Fast delivery and good quality.")
                                .build();

                when(supplierRatingRepository.save(any(SupplierRating.class))).thenReturn(savedRating);
                when(supplierRatingRepository.findAverageRatingBySupplierId(100L)).thenReturn(4.5);
                when(supplierRatingRepository.findAverageProductRatingByProductId(anyLong())).thenReturn(5.0);
                when(supplierRatingRepository.countRatingsByProductId(anyLong())).thenReturn(1);
                when(userRepository.findBySupplierId(100L)).thenReturn(java.util.Collections.emptyList());

                SupplierRatingResponseDTO expectedResponse = SupplierRatingResponseDTO.builder()
                                .id(1L)
                                .supplierId(100L)
                                .orderId(123L)
                                .userId(10L)
                                .productRating(5)
                                .serviceRating(4)
                                .review("Fast delivery and good quality.")
                                .build();

                when(supplierRatingMapper.toDto(savedRating)).thenReturn(expectedResponse);

                SupplierRatingResponseDTO response = supplierRatingService.createRating(100L, requestDTO, employeeUser);

                assertNotNull(response);
                assertEquals(5, response.getProductRating());
                assertEquals(4, response.getServiceRating());
                assertEquals("Fast delivery and good quality.", response.getReview());
                verify(supplierRatingRepository, times(1)).save(any(SupplierRating.class));
                verify(supplierRepository, times(1)).save(supplier);
        }

        @Test
        void testCreateRating_OrderNotDelivered_ThrowsIllegalOperation() {
                SupplierRatingRequestDTO requestDTO = SupplierRatingRequestDTO.builder()
                                .orderId(124L)
                                .productRating(4)
                                .serviceRating(4)
                                .build();

                when(supplierRepository.findById(100L)).thenReturn(Optional.of(supplier));
                when(purchaseOrderRepository.findById(124L)).thenReturn(Optional.of(pendingOrder));

                IllegalOperationException ex = assertThrows(IllegalOperationException.class,
                                () -> supplierRatingService.createRating(100L, requestDTO, employeeUser));

                assertTrue(ex.getMessage().contains("delivered"));
                verify(supplierRatingRepository, never()).save(any());
        }

        @Test
        void testCreateRating_NotUserOrder_ThrowsIllegalOperation() {
                SupplierRatingRequestDTO requestDTO = SupplierRatingRequestDTO.builder()
                                .orderId(123L)
                                .productRating(4)
                                .serviceRating(4)
                                .build();

                when(supplierRepository.findById(100L)).thenReturn(Optional.of(supplier));
                when(purchaseOrderRepository.findById(123L)).thenReturn(Optional.of(deliveredOrder));

                IllegalOperationException ex = assertThrows(IllegalOperationException.class,
                                () -> supplierRatingService.createRating(100L, requestDTO, otherUser));

                assertTrue(ex.getMessage().contains("not authorized"));
                verify(supplierRatingRepository, never()).save(any());
        }

        @Test
        void testCreateRating_WrongSupplier_ThrowsIllegalOperation() {
                SupplierRatingRequestDTO requestDTO = SupplierRatingRequestDTO.builder()
                                .orderId(123L)
                                .productRating(4)
                                .serviceRating(4)
                                .build();

                when(supplierRepository.findById(200L)).thenReturn(Optional.of(otherSupplier));
                when(purchaseOrderRepository.findById(123L)).thenReturn(Optional.of(deliveredOrder));

                IllegalOperationException ex = assertThrows(IllegalOperationException.class,
                                () -> supplierRatingService.createRating(200L, requestDTO, employeeUser));

                assertTrue(ex.getMessage().contains("not associated with supplier"));
                verify(supplierRatingRepository, never()).save(any());
        }

        @Test
        void testCreateRating_DuplicateRating_ThrowsResourceAlreadyReviewed() {
                SupplierRatingRequestDTO requestDTO = SupplierRatingRequestDTO.builder()
                                .orderId(123L)
                                .productRating(5)
                                .serviceRating(5)
                                .build();

                when(supplierRepository.findById(100L)).thenReturn(Optional.of(supplier));
                when(purchaseOrderRepository.findById(123L)).thenReturn(Optional.of(deliveredOrder));
                when(supplierRatingRepository.existsByPurchaseOrderId(123L)).thenReturn(true);

                assertThrows(ResourceAlreadyReviewedException.class,
                                () -> supplierRatingService.createRating(100L, requestDTO, employeeUser));

                verify(supplierRatingRepository, never()).save(any());
        }

        @Test
        void testGetSupplierRatingSummary_Success() {
                when(supplierRepository.existsById(100L)).thenReturn(true);
                when(supplierRatingRepository.countBySupplierId(100L)).thenReturn(25L);
                when(supplierRatingRepository.findAverageProductRatingBySupplierId(100L)).thenReturn(4.32);
                when(supplierRatingRepository.findAverageServiceRatingBySupplierId(100L)).thenReturn(4.12);

                SupplierRatingSummaryDTO summary = supplierRatingService.getSupplierRatingSummary(100L);

                assertNotNull(summary);
                assertEquals(100L, summary.getSupplierId());
                assertEquals(4.3, summary.getAverageProductRating());
                assertEquals(4.1, summary.getAverageServiceRating());
                assertEquals(25L, summary.getTotalRatings());
        }
}
