package com.infosys.procurement_system.service;

import com.infosys.procurement_system.entity.Order;
import com.infosys.procurement_system.entity.Payment;
import com.infosys.procurement_system.entity.Shipment;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.OrderStatus;
import com.infosys.procurement_system.repository.OrderRepository;
import com.infosys.procurement_system.repository.PaymentRepository;
import com.infosys.procurement_system.repository.ShipmentRepository;
import com.infosys.procurement_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentModuleService {

        private final OrderRepository orderRepository;
        private final PaymentRepository paymentRepository;
        private final UserRepository userRepository;
        private final ShipmentRepository shipmentRepository;

        @Transactional
        public String processPayment(Long orderId, Long adminId, String paymentMethod, String upiId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (order.getStatus() != OrderStatus.APPROVED) {
                        throw new RuntimeException("Order must be APPROVED before payment");
                }

                User admin = userRepository.findById(adminId)
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                // Generate unique TXN ID
                String txnId = "TXN-" + System.nanoTime() + "-" + UUID.randomUUID().toString().substring(0, 8);

                Payment payment = Payment.builder()
                                .txnId(txnId)
                                // .order(order) // Legacy: Payment now links to PurchaseOrder, not Order
                                .admin(admin)
                                .supplier(order.getSupplier())
                                .amount(order.getTotalAmount())
                                .paymentMethod(paymentMethod)
                                .status("SUCCESS")
                                .build();

                paymentRepository.save(payment);

                // Update supplier balance if a supplier is linked
                if (order.getSupplier() != null) {
                        order.getSupplier().setTotalReceived(
                                        order.getSupplier().getTotalReceived().add(order.getTotalAmount()));
                }

                // Update Order Status
                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);

                // Auto-create empty shipment
                Shipment shipment = Shipment.builder()
                                .order(order)
                                .status("PENDING")
                                .build();
                shipmentRepository.save(shipment);

                return txnId;
        }
}
