package com.infosys.procurement_system.email;

import com.infosys.procurement_system.email.dto.*;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateService emailTemplateService;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.admin-email}")
    private String defaultAdminEmail;

    @Override
    @Async("emailTaskExecutor")
    public void sendIssueCreatedEmail(IssueEmailDTO dto) {
        log.info("Sending Issue Created email to: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_ISSUE_RAISED, vars);
            String subject = String.format(EmailConstants.SUBJECT_ISSUE_SUBMITTED, dto.getIssueId());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Issue Created email for Issue #{}: {}", dto.getIssueId(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendIssueStatusUpdatedEmail(IssueStatusUpdateEmailDTO dto) {
        log.info("Sending Issue Status Update email to: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_ISSUE_UPDATED, vars);
            String subject = String.format(EmailConstants.SUBJECT_ISSUE_UPDATED, dto.getIssueId());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Issue Status Update email for Issue #{}: {}", dto.getIssueId(), e.getMessage(),
                    e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendIssueClosedEmail(IssueClosedEmailDTO dto) {
        log.info("Sending Issue Closed email to: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_ISSUE_CLOSED, vars);
            String subject = String.format(EmailConstants.SUBJECT_ISSUE_CLOSED, dto.getIssueId());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Issue Closed email for Issue #{}: {}", dto.getIssueId(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendApplicationStatusEmail(ApplicationStatusEmailDTO dto) {
        log.info("Sending Application Status email to: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String templateName = "APPROVED".equalsIgnoreCase(dto.getCurrentStatus())
                    ? EmailConstants.TEMPLATE_REQUEST_APPROVED
                    : ("REJECTED".equalsIgnoreCase(dto.getCurrentStatus())
                            ? EmailConstants.TEMPLATE_REQUEST_REJECTED
                            : EmailConstants.TEMPLATE_ADMIN_NOTIFICATION);
            String htmlContent = emailTemplateService.processTemplate(templateName, vars);
            String subject = String.format(EmailConstants.SUBJECT_APPLICATION_STATUS, dto.getRequestId());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Application Status email for Request #{}: {}", dto.getRequestId(), e.getMessage(),
                    e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAdminIssueNotification(AdminNotificationDTO dto) {
        String targetAdmin = dto.getAdminEmail() != null ? dto.getAdminEmail() : defaultAdminEmail;
        log.info("Sending Admin Issue Notification to: {}", targetAdmin);
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_ADMIN_NOTIFICATION, vars);
            sendHtmlEmail(targetAdmin, EmailConstants.SUBJECT_ADMIN_ISSUE, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Admin Issue Notification for Issue #{}: {}", dto.getIssueId(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendAdminProcurementNotification(AdminNotificationDTO dto) {
        String targetAdmin = dto.getAdminEmail() != null ? dto.getAdminEmail() : defaultAdminEmail;
        log.info("Sending Admin Procurement Notification to: {}", targetAdmin);
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_ADMIN_NOTIFICATION, vars);
            sendHtmlEmail(targetAdmin, EmailConstants.SUBJECT_ADMIN_PROCUREMENT, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Admin Procurement Notification for Request #{}: {}", dto.getRequestId(),
                    e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendApprovalRequiredEmail(ApprovalRequiredEmailDTO dto) {
        String targetAdmin = dto.getAdminEmail() != null ? dto.getAdminEmail() : defaultAdminEmail;
        log.info("Sending Approval Required email to: {} for entity {}", targetAdmin, dto.getEntityType());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_APPROVAL_REQUIRED, vars);
            String subject = String.format(EmailConstants.SUBJECT_APPROVAL_REQUIRED, dto.getEntityType(),
                    dto.getEntityId());
            sendHtmlEmail(targetAdmin, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Approval Required email for {} ID {}: {}", dto.getEntityType(), dto.getEntityId(),
                    e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(WelcomeEmailDTO dto) {
        log.info("Sending Welcome email to new employee: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_WELCOME, vars);
            sendHtmlEmail(dto.getRecipientEmail(), EmailConstants.SUBJECT_WELCOME, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send Welcome email to {}: {}", dto.getRecipientEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendShipmentStatusEmail(ShipmentStatusEmailDTO dto) {
        sendDeliveryStatusEmail(dto);
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendProcurementCreatedEmployeeEmail(ApplicationStatusEmailDTO dto) {
        log.info("Sending Procurement Created email to employee: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_PROCUREMENT_CREATED, vars);
            String subject = String.format(EmailConstants.SUBJECT_PROCUREMENT_CREATED_EMPLOYEE, dto.getRequestId());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
            log.info("NOTIFICATION_SENT event=PROCUREMENT_CREATED po={} status=PENDING recipient={}", dto.getRequestId(), dto.getRecipientEmail());
        } catch (Exception e) {
            log.error("NOTIFICATION_FAILED event=PROCUREMENT_CREATED po={} status=PENDING recipient={}: {}", dto.getRequestId(), dto.getRecipientEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendPaymentCompletedEmployeeEmail(PaymentEmailDTO dto) {
        log.info("Sending Payment Completed email to employee: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_PAYMENT_COMPLETED, vars);
            String subject = String.format(EmailConstants.SUBJECT_PAYMENT_COMPLETED_EMPLOYEE, dto.getPoNumber());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
            log.info("NOTIFICATION_SENT event=PAYMENT_COMPLETED po={} status=PAID recipient={}", dto.getPoNumber(), dto.getRecipientEmail());
        } catch (Exception e) {
            log.error("NOTIFICATION_FAILED event=PAYMENT_COMPLETED po={} status=PAID recipient={}: {}", dto.getPoNumber(), dto.getRecipientEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendSupplierNewOrderEmail(PaymentEmailDTO dto) {
        log.info("Sending New Order email to supplier: {}", dto.getRecipientEmail());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String htmlContent = emailTemplateService.processTemplate(EmailConstants.TEMPLATE_SUPPLIER_NEW_ORDER, vars);
            String subject = String.format(EmailConstants.SUBJECT_SUPPLIER_NEW_ORDER, dto.getPoNumber());
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
            log.info("NOTIFICATION_SENT event=SUPPLIER_NEW_ORDER po={} status=NEW_ORDER recipient={}", dto.getPoNumber(), dto.getRecipientEmail());
        } catch (Exception e) {
            log.error("NOTIFICATION_FAILED event=SUPPLIER_NEW_ORDER po={} status=NEW_ORDER recipient={}: {}", dto.getPoNumber(), dto.getRecipientEmail(), e.getMessage(), e);
        }
    }

    @Override
    @Async("emailTaskExecutor")
    public void sendDeliveryStatusEmail(ShipmentStatusEmailDTO dto) {
        log.info("Sending Delivery Status email to: {} for status {}", dto.getRecipientEmail(), dto.getDeliveryStatus());
        try {
            Map<String, Object> vars = new HashMap<>();
            vars.put("dto", dto);
            String statusUpper = dto.getDeliveryStatus() != null ? dto.getDeliveryStatus().toUpperCase() : "";
            String templateName;
            String subject;

            switch (statusUpper) {
                case "SHIPPING":
                    templateName = EmailConstants.TEMPLATE_ORDER_SHIPPED;
                    subject = String.format(EmailConstants.SUBJECT_ORDER_SHIPPED, dto.getPoNumber() != null ? dto.getPoNumber() : dto.getPurchaseOrderId());
                    break;
                case "OUT_FOR_DELIVERY":
                    templateName = EmailConstants.TEMPLATE_ORDER_OUT_FOR_DELIVERY;
                    subject = String.format(EmailConstants.SUBJECT_ORDER_OUT_FOR_DELIVERY, dto.getPoNumber() != null ? dto.getPoNumber() : dto.getPurchaseOrderId());
                    break;
                case "DELIVERED":
                    templateName = EmailConstants.TEMPLATE_ORDER_DELIVERED;
                    subject = String.format(EmailConstants.SUBJECT_ORDER_DELIVERED, dto.getPoNumber() != null ? dto.getPoNumber() : dto.getPurchaseOrderId());
                    break;
                default:
                    templateName = EmailConstants.TEMPLATE_ADMIN_NOTIFICATION;
                    subject = "Procurement Order Shipment Update: " + dto.getDeliveryStatus();
                    break;
            }

            String htmlContent = emailTemplateService.processTemplate(templateName, vars);
            sendHtmlEmail(dto.getRecipientEmail(), subject, htmlContent);
            log.info("NOTIFICATION_SENT event=DELIVERY_STATUS_CHANGED po={} status={} recipient={}", dto.getPoNumber() != null ? dto.getPoNumber() : dto.getPurchaseOrderId(), dto.getDeliveryStatus(), dto.getRecipientEmail());
        } catch (Exception e) {
            log.error("NOTIFICATION_FAILED event=DELIVERY_STATUS_CHANGED po={} status={} recipient={}: {}", dto.getPoNumber() != null ? dto.getPoNumber() : dto.getPurchaseOrderId(), dto.getDeliveryStatus(), dto.getRecipientEmail(), e.getMessage(), e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
        log.info("Email successfully sent to {}", to);
    }
}
