package com.infosys.procurement_system.email;

import com.infosys.procurement_system.email.dto.*;

public interface EmailService {

    void sendIssueCreatedEmail(IssueEmailDTO dto);

    void sendIssueStatusUpdatedEmail(IssueStatusUpdateEmailDTO dto);

    void sendIssueClosedEmail(IssueClosedEmailDTO dto);

    void sendApplicationStatusEmail(ApplicationStatusEmailDTO dto);

    void sendAdminIssueNotification(AdminNotificationDTO dto);

    void sendAdminProcurementNotification(AdminNotificationDTO dto);

    void sendApprovalRequiredEmail(ApprovalRequiredEmailDTO dto);

    void sendWelcomeEmail(WelcomeEmailDTO dto);

    void sendShipmentStatusEmail(ShipmentStatusEmailDTO dto);

    void sendProcurementCreatedEmployeeEmail(ApplicationStatusEmailDTO dto);

    void sendPaymentCompletedEmployeeEmail(PaymentEmailDTO dto);

    void sendSupplierNewOrderEmail(PaymentEmailDTO dto);

    void sendDeliveryStatusEmail(ShipmentStatusEmailDTO dto);
}
