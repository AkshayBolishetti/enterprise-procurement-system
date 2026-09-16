package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.email.EmailService;
import com.infosys.procurement_system.email.dto.*;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmailEventListener {

    private final EmailService emailService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueCreated(IssueCreatedEvent event) {
        Issue issue = event.getIssue();
        User employee = issue.getCreatedBy();
        log.info("Handling IssueCreatedEvent post-commit for Issue ID {}", issue.getIssueNumber());

        // 1. Employee Confirmation Email
        if (employee != null && employee.getEmail() != null) {
            IssueEmailDTO issueEmailDTO = IssueEmailDTO.builder()
                    .recipientEmail(employee.getEmail())
                    .employeeName(employee.getName())
                    .issueId(issue.getIssueNumber() != null ? issue.getIssueNumber() : String.valueOf(issue.getId()))
                    .issueSubject(issue.getTitle())
                    .description(issue.getDescription())
                    .priority(issue.getPriority() != null ? issue.getPriority().name() : "NORMAL")
                    .department(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "N/A")
                    .createdDateTime(issue.getCreatedAt() != null ? issue.getCreatedAt() : LocalDateTime.now())
                    .currentStatus(issue.getStatus() != null ? issue.getStatus().name() : "OPEN")
                    .confirmationMessage("Your request has been successfully submitted to our support queue.")
                    .build();
            emailService.sendIssueCreatedEmail(issueEmailDTO);
        }

        // 2. Admin Notification Email
        AdminNotificationDTO adminDTO = AdminNotificationDTO.builder()
                .notificationType("ISSUE")
                .employeeName(employee != null ? employee.getName() : "Unknown")
                .employeeEmail(employee != null ? employee.getEmail() : "N/A")
                .employeeId(employee != null ? employee.getEmployeeId() : "N/A")
                .department(employee != null && employee.getDepartment() != null
                        ? employee.getDepartment().getDepartmentName()
                        : "N/A")
                .issueId(issue.getIssueNumber() != null ? issue.getIssueNumber() : String.valueOf(issue.getId()))
                .subject(issue.getTitle())
                .priority(issue.getPriority() != null ? issue.getPriority().name() : "NORMAL")
                .category("Technical Support")
                .createdTime(issue.getCreatedAt() != null ? issue.getCreatedAt() : LocalDateTime.now())
                .build();
        emailService.sendAdminIssueNotification(adminDTO);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueStatusUpdated(IssueStatusUpdatedEvent event) {
        Issue issue = event.getIssue();
        User employee = issue.getCreatedBy();
        log.info("Handling IssueStatusUpdatedEvent post-commit for Issue ID {}", issue.getIssueNumber());

        if (employee != null && employee.getEmail() != null) {
            IssueStatusUpdateEmailDTO dto = IssueStatusUpdateEmailDTO.builder()
                    .recipientEmail(employee.getEmail())
                    .employeeName(employee.getName())
                    .issueId(issue.getIssueNumber() != null ? issue.getIssueNumber() : String.valueOf(issue.getId()))
                    .previousStatus(event.getPreviousStatus())
                    .newStatus(issue.getStatus() != null ? issue.getStatus().name() : "UNKNOWN")
                    .updatedBy(event.getUpdatedBy())
                    .updatedTime(LocalDateTime.now())
                    .adminRemarks(event.getAdminRemarks())
                    .build();
            emailService.sendIssueStatusUpdatedEmail(dto);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleIssueClosed(IssueClosedEvent event) {
        Issue issue = event.getIssue();
        User employee = issue.getCreatedBy();
        log.info("Handling IssueClosedEvent post-commit for Issue ID {}", issue.getIssueNumber());

        if (employee != null && employee.getEmail() != null) {
            IssueClosedEmailDTO dto = IssueClosedEmailDTO.builder()
                    .recipientEmail(employee.getEmail())
                    .employeeName(employee.getName())
                    .issueId(issue.getIssueNumber() != null ? issue.getIssueNumber() : String.valueOf(issue.getId()))
                    .resolutionSummary(event.getResolutionSummary() != null ? event.getResolutionSummary()
                            : "Request successfully closed by administration.")
                    .closedBy(event.getClosedBy())
                    .closedDate(issue.getResolvedAt() != null ? issue.getResolvedAt() : LocalDateTime.now())
                    .thankYouMessage(
                            "Thank you for reaching out to us. If you experience further requests, please let us know.")
                    .build();
            emailService.sendIssueClosedEmail(dto);
        }
    }

    @Value("${app.email.admin-email:admin@procurement.com}")
    private String defaultAdminEmail;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        // Disabled legacy event handling
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleUserRegistered(UserRegisteredEvent event) {
        User user = event.getUser();
        log.info("Handling UserRegisteredEvent post-commit for User Email {}", user.getEmail());

        // 1. Welcome Email to Employee
        if (user.getEmail() != null) {
            WelcomeEmailDTO welcomeDTO = WelcomeEmailDTO.builder()
                    .recipientEmail(user.getEmail())
                    .employeeName(user.getName())
                    .employeeId(user.getEmployeeId())
                    .department(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : "General")
                    .designation(user.getDesignation() != null ? user.getDesignation() : "Employee")
                    .role(user.getRole() != null ? user.getRole().name() : "EMPLOYEE")
                    .build();
            emailService.sendWelcomeEmail(welcomeDTO);
        }

        // 2. Admin Notification Email
        AdminNotificationDTO adminDTO = AdminNotificationDTO.builder()
                .notificationType("EMPLOYEE_ACCOUNT")
                .employeeName(user.getName())
                .employeeEmail(user.getEmail())
                .employeeId(user.getEmployeeId())
                .department(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : "General")
                .role(user.getRole() != null ? user.getRole().name() : "EMPLOYEE")
                .createdTime(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now())
                .build();
        emailService.sendAdminIssueNotification(adminDTO);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApprovalRequired(ApprovalRequiredEvent event) {
        log.info("Handling ApprovalRequiredEvent post-commit for Entity {} ({})", event.getEntityType(),
                event.getEntityId());
        ApprovalRequiredEmailDTO dto = ApprovalRequiredEmailDTO.builder()
                .entityType(event.getEntityType())
                .entityId(event.getEntityId())
                .entityName(event.getEntityName())
                .requestedBy(event.getRequestedBy())
                .requestedByEmail(event.getRequestedByEmail())
                .department(event.getDepartment())
                .details(event.getDetails())
                .requestTime(event.getRequestTime())
                .build();
        emailService.sendApprovalRequiredEmail(dto);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleShipmentStatusUpdated(ShipmentStatusUpdatedEvent event) {
        // Disabled legacy event handling
    }
}
