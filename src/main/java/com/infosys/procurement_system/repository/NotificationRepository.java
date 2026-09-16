package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByTimestampDesc(Long recipientId);
    List<Notification> findByRecipientIdAndIsReadFalseOrderByTimestampDesc(Long recipientId);
}
