package com.infosys.procurement_system.email;

public final class EmailConstants {

    private EmailConstants() {
        // Private constructor to prevent instantiation
    }

    // Template Files
    public static final String TEMPLATE_WELCOME = "email/welcome_email";
    public static final String TEMPLATE_ISSUE_RAISED = "email/issue_raised";
    public static final String TEMPLATE_ISSUE_UPDATED = "email/issue_updated";
    public static final String TEMPLATE_ISSUE_CLOSED = "email/issue_closed";
    public static final String TEMPLATE_REQUEST_APPROVED = "email/request_approved";
    public static final String TEMPLATE_REQUEST_REJECTED = "email/request_rejected";
    public static final String TEMPLATE_ADMIN_NOTIFICATION = "email/admin_notification";
    public static final String TEMPLATE_APPROVAL_REQUIRED = "email/approval_required";
    public static final String TEMPLATE_PROCUREMENT_CREATED = "email/procurement_created";
    public static final String TEMPLATE_PAYMENT_COMPLETED = "email/payment_completed";
    public static final String TEMPLATE_SUPPLIER_NEW_ORDER = "email/supplier_new_order";
    public static final String TEMPLATE_ORDER_SHIPPED = "email/order_shipped";
    public static final String TEMPLATE_ORDER_OUT_FOR_DELIVERY = "email/order_out_for_delivery";
    public static final String TEMPLATE_ORDER_DELIVERED = "email/order_delivered";

    // Subjects
    public static final String SUBJECT_ISSUE_SUBMITTED = "Request Submitted Successfully - Request #%s";
    public static final String SUBJECT_ISSUE_UPDATED = "Request Status Updated - Request #%s";
    public static final String SUBJECT_ISSUE_CLOSED = "Request Closed - Request #%s";
    public static final String SUBJECT_APPLICATION_STATUS = "Application Status Updated - Request #%s";
    public static final String SUBJECT_ADMIN_ISSUE = "New Request Raised by Employee";
    public static final String SUBJECT_ADMIN_PROCUREMENT = "New Procurement Request Submitted";
    public static final String SUBJECT_ADMIN_EMPLOYEE = "New Employee Account Created";
    public static final String SUBJECT_APPROVAL_REQUIRED = "Approval Required - %s: %s";
    public static final String SUBJECT_WELCOME = "Welcome to Enterprise Procurement System!";
    public static final String SUBJECT_PROCUREMENT_CREATED_EMPLOYEE = "Procurement Request Created - Request #%s";
    public static final String SUBJECT_PAYMENT_COMPLETED_EMPLOYEE = "Purchase Order Paid – Shipment Processing Started - PO #%s";
    public static final String SUBJECT_SUPPLIER_NEW_ORDER = "New Paid Purchase Order Available - PO #%s";
    public static final String SUBJECT_ORDER_SHIPPED = "Your Order Has Been Shipped - PO #%s";
    public static final String SUBJECT_ORDER_OUT_FOR_DELIVERY = "Your Order Is Out for Delivery - PO #%s";
    public static final String SUBJECT_ORDER_DELIVERED = "Order Delivered Successfully - PO #%s";
}
