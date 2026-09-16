package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.OrderMessageDTO;
import com.infosys.procurement_system.entity.OrderMessage;
import com.infosys.procurement_system.entity.PurchaseOrder;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.repository.OrderMessageRepository;
import com.infosys.procurement_system.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderMessageService {

    private final OrderMessageRepository orderMessageRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Transactional(readOnly = true)
    public List<OrderMessageDTO> getMessagesForOrder(Long orderId, User currentUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", orderId));

        validateAccess(po, currentUser);

        return orderMessageRepository.findByPurchaseOrderIdOrderByTimestampAsc(orderId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderMessageDTO sendMessage(Long orderId, String message, User currentUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", orderId));

        validateAccess(po, currentUser);

        OrderMessage orderMessage = OrderMessage.builder()
                .purchaseOrder(po)
                .sender(currentUser)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

        return toDto(orderMessageRepository.save(orderMessage));
    }

    private void validateAccess(PurchaseOrder po, User user) {
        if (user.getRole() == Role.ADMIN) return;
        
        if (user.getRole() == Role.EMPLOYEE && (po.getIssue() == null || po.getIssue().getCreatedBy() == null || !po.getIssue().getCreatedBy().getId().equals(user.getId()))) {
            throw new AccessDeniedException("You can only access messages for your own orders.");
        }
        
        if (user.getRole() == Role.SUPPLIER) {
            if (po.getSupplier() == null || user.getSupplier() == null || !po.getSupplier().getId().equals(user.getSupplier().getId())) {
                throw new AccessDeniedException("You can only access messages for orders assigned to you.");
            }
        }
    }

    private OrderMessageDTO toDto(OrderMessage entity) {
        return OrderMessageDTO.builder()
                .id(entity.getId())
                .purchaseOrderId(entity.getPurchaseOrder().getId())
                .senderId(entity.getSender().getId())
                .senderName(entity.getSender().getName())
                .message(entity.getMessage())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
