package com.infosys.procurement_system.email;

import com.infosys.procurement_system.email.dto.*;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailServiceImpl emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "noreply@procurement-system.com");
        ReflectionTestUtils.setField(emailService, "defaultAdminEmail", "admin@procurement-system.com");
    }

    @Test
    void testSendIssueCreatedEmail_Success() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        IssueEmailDTO dto = IssueEmailDTO.builder()
                .recipientEmail("employee@example.com")
                .employeeName("John Employee")
                .issueId("ISS-1001")
                .issueSubject("Laptop Screen Flicker")
                .description("Screen flickers on startup")
                .priority("HIGH")
                .department("Engineering")
                .createdDateTime(LocalDateTime.now())
                .currentStatus("OPEN")
                .confirmationMessage("Request logged successfully.")
                .build();

        emailService.sendIssueCreatedEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendIssueCreatedEmail_FailureHandledGracefully() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("SMTP Server Unreachable")).when(mailSender).send(any(MimeMessage.class));

        IssueEmailDTO dto = IssueEmailDTO.builder()
                .recipientEmail("employee@example.com")
                .issueId("ISS-1001")
                .build();

        // Must not throw an exception to caller
        emailService.sendIssueCreatedEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendIssueStatusUpdatedEmail() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        IssueStatusUpdateEmailDTO dto = IssueStatusUpdateEmailDTO.builder()
                .recipientEmail("employee@example.com")
                .employeeName("Jane Doe")
                .issueId("ISS-1002")
                .previousStatus("OPEN")
                .newStatus("IN_PROGRESS")
                .updatedBy("Admin")
                .updatedTime(LocalDateTime.now())
                .adminRemarks("Technician assigned")
                .build();

        emailService.sendIssueStatusUpdatedEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendIssueClosedEmail() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        IssueClosedEmailDTO dto = IssueClosedEmailDTO.builder()
                .recipientEmail("employee@example.com")
                .employeeName("Jane Doe")
                .issueId("ISS-1002")
                .resolutionSummary("Hardware replaced")
                .closedBy("Admin")
                .closedDate(LocalDateTime.now())
                .thankYouMessage("Thank you!")
                .build();

        emailService.sendIssueClosedEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendApplicationStatusEmail() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        ApplicationStatusEmailDTO dto = ApplicationStatusEmailDTO.builder()
                .recipientEmail("employee@example.com")
                .employeeName("Jane Doe")
                .requestId("PR-5001")
                .productName("Monitor")
                .previousStatus("PENDING")
                .currentStatus("APPROVED")
                .updatedTime(LocalDateTime.now())
                .adminRemarks("Approved by finance")
                .build();

        emailService.sendApplicationStatusEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendAdminNotifications() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        AdminNotificationDTO issueDTO = AdminNotificationDTO.builder()
                .notificationType("ISSUE")
                .adminEmail("admin@example.com")
                .employeeName("John Employee")
                .issueId("ISS-1001")
                .createdTime(LocalDateTime.now())
                .build();

        emailService.sendAdminIssueNotification(issueDTO);

        AdminNotificationDTO procurementDTO = AdminNotificationDTO.builder()
                .notificationType("PROCUREMENT")
                .adminEmail("admin@example.com")
                .requestId("PR-101")
                .requestedProduct("Laptop")
                .quantity(2)
                .budget(new BigDecimal("2500.00"))
                .createdTime(LocalDateTime.now())
                .build();

        emailService.sendAdminProcurementNotification(procurementDTO);

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void testSendApprovalRequiredEmail() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        ApprovalRequiredEmailDTO dto = ApprovalRequiredEmailDTO.builder()
                .adminEmail("admin@example.com")
                .entityType("Product Approval")
                .entityId("PROD-88")
                .entityName("Server Rack")
                .requestedBy("Dev Ops")
                .details("High availability setup")
                .requestTime(LocalDateTime.now())
                .build();

        emailService.sendApprovalRequiredEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void testSendWelcomeEmail() {
        when(emailTemplateService.processTemplate(anyString(), any())).thenReturn("<html>Test</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        WelcomeEmailDTO dto = WelcomeEmailDTO.builder()
                .recipientEmail("newemp@example.com")
                .employeeName("New Employee")
                .employeeId("EMP99")
                .department("HR")
                .designation("HR Specialist")
                .role("EMPLOYEE")
                .build();

        emailService.sendWelcomeEmail(dto);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
