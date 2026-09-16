package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.NotificationDTO;
import com.infosys.procurement_system.entity.Notification;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyNotifications(User user) {
        return notificationRepository.findByRecipientIdOrderByTimestampDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getMyUnreadNotifications(User user) {
        return notificationRepository.findByRecipientIdAndIsReadFalseOrderByTimestampDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public void createNotification(User recipient, String title, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Not your notification");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadFalseOrderByTimestampDesc(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO toDto(Notification entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .timestamp(entity.getTimestamp())
                .build();
    }
}
