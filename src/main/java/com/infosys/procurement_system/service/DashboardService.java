package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.AdminDashboardDTO;
import com.infosys.procurement_system.dto.UserDashboardDTO;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.repository.SupplierRepository;
import com.infosys.procurement_system.repository.PaymentRepository;
import com.infosys.procurement_system.repository.ProductRepository;
import com.infosys.procurement_system.repository.IssueRepository;
import com.infosys.procurement_system.repository.PurchaseOrderRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import com.infosys.procurement_system.dto.SpendingAnalyticsDTO;
import com.infosys.procurement_system.entity.Payment;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SupplierRepository supplierRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final IssueRepository issueRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDTO getAdminDashboard() {
        return getAdminDashboard(null);
    }

    @Transactional(readOnly = true)
    public AdminDashboardDTO getAdminDashboard(User currentUser) {
        long totalRequests = issueRepository.count();
        long pendingRequests = issueRepository.countByStatus(com.infosys.procurement_system.enums.IssueStatus.PENDING);
        long approvedRequests = issueRepository.countByStatus(com.infosys.procurement_system.enums.IssueStatus.PAYMENT_PENDING);
        long rejectedRequests = issueRepository.countByStatus(com.infosys.procurement_system.enums.IssueStatus.REJECTED);
        
        long totalProducts = productRepository.count();
        long totalSuppliers = supplierRepository.count();
        
        long activeOrders = purchaseOrderRepository.countByDeliveryStatus(com.infosys.procurement_system.enums.DeliveryStatus.PROCESSING);
        long deliveredOrders = purchaseOrderRepository.countByDeliveryStatus(com.infosys.procurement_system.enums.DeliveryStatus.DELIVERED);

        BigDecimal totalSpend = paymentRepository.sumAmountByStatus("PAID");
        if (totalSpend == null)
            totalSpend = BigDecimal.ZERO;

        BigDecimal pendingPaymentAmount = issueRepository.sumTotalPriceByStatus(com.infosys.procurement_system.enums.IssueStatus.PAYMENT_PENDING);
        if (pendingPaymentAmount == null) {
            pendingPaymentAmount = BigDecimal.ZERO;
        }

        return AdminDashboardDTO.builder()
                .totalRequests(totalRequests)
                .pendingRequests(pendingRequests)
                .approvedRequests(approvedRequests)
                .rejectedRequests(rejectedRequests)
                .totalProducts(totalProducts)
                .totalSuppliers(totalSuppliers)
                .activeOrders(activeOrders)
                .deliveredOrders(deliveredOrders)
                .totalSpend(totalSpend)
                .pendingPaymentAmount(pendingPaymentAmount)
                .build();
    }

    @Transactional(readOnly = true)
    public com.infosys.procurement_system.dto.SupplierDashboardDTO getSupplierDashboard(User currentUser) {
        if (currentUser.getSupplier() == null) {
            throw new IllegalArgumentException("User is not associated with a supplier");
        }
        Long supplierId = currentUser.getSupplier().getId();
        
        long totalProducts = productRepository.countBySupplierId(supplierId);
        long activeProducts = productRepository.countBySupplierIdAndStatus(supplierId, com.infosys.procurement_system.enums.ProductStatus.APPROVED);
        long lowStock = productRepository.countLowStockBySupplierId(supplierId);
        long outOfStock = productRepository.countOutOfStockBySupplierId(supplierId);
        
        BigDecimal totalReceived = currentUser.getSupplier().getTotalReceived() != null ? currentUser.getSupplier().getTotalReceived() : BigDecimal.ZERO;
        
        long totalOrders = purchaseOrderRepository.countBySupplierId(supplierId);
        long pendingOrders = purchaseOrderRepository.countBySupplierIdAndDeliveryStatus(supplierId, com.infosys.procurement_system.enums.DeliveryStatus.PROCESSING);
        long shippedOrders = purchaseOrderRepository.countBySupplierIdAndDeliveryStatus(supplierId, com.infosys.procurement_system.enums.DeliveryStatus.SHIPPED);
        long deliveredOrders = purchaseOrderRepository.countBySupplierIdAndDeliveryStatus(supplierId, com.infosys.procurement_system.enums.DeliveryStatus.DELIVERED);
        
        return com.infosys.procurement_system.dto.SupplierDashboardDTO.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .lowStock(lowStock)
                .outOfStock(outOfStock)
                .totalReceived(totalReceived)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDashboardDTO getUserDashboard(User currentUser) {
        Long userId = currentUser.getId();
        
        long totalMyRequests = issueRepository.countByCreatedById(userId);
        long pendingMyRequests = issueRepository.countByCreatedByIdAndStatus(userId, com.infosys.procurement_system.enums.IssueStatus.PENDING);
        long approvedMyRequests = issueRepository.countByCreatedByIdAndStatus(userId, com.infosys.procurement_system.enums.IssueStatus.PAYMENT_PENDING)
            + issueRepository.countByCreatedByIdAndStatus(userId, com.infosys.procurement_system.enums.IssueStatus.PAID)
            + issueRepository.countByCreatedByIdAndStatus(userId, com.infosys.procurement_system.enums.IssueStatus.FULFILLING)
            + issueRepository.countByCreatedByIdAndStatus(userId, com.infosys.procurement_system.enums.IssueStatus.COMPLETED);
        long myOrders = purchaseOrderRepository.countByIssue_CreatedById(userId);
        
        return UserDashboardDTO.builder()
                .totalMyRequests(totalMyRequests)
                .pendingMyRequests(pendingMyRequests)
                .approvedMyRequests(approvedMyRequests)
                .totalMyIssues(0L) // Legacy fallback
                .openMyIssues(0L)  // Legacy fallback
                .resolvedMyIssues(0L) // Legacy fallback
                .closedMyIssues(0L) // Legacy fallback
                .myOrders(myOrders)
                .build();
    }

    @Transactional(readOnly = true)
    public SpendingAnalyticsDTO getSpendingAnalytics(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        LocalDateTime endDate;
        Map<String, BigDecimal> groupedData = new LinkedHashMap<>();

        if ("weekly".equalsIgnoreCase(period)) {
            startDate = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);
            endDate = startDate.plusDays(6).with(LocalTime.MAX);
            String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
            for (String day : days) {
                groupedData.put(day, BigDecimal.ZERO);
            }
        } else if ("monthly".equalsIgnoreCase(period)) {
            startDate = now.withDayOfMonth(1).with(LocalTime.MIN);
            endDate = now.withDayOfMonth(now.getMonth().length(now.toLocalDate().isLeapYear())).with(LocalTime.MAX);
            groupedData.put("Week 1", BigDecimal.ZERO);
            groupedData.put("Week 2", BigDecimal.ZERO);
            groupedData.put("Week 3", BigDecimal.ZERO);
            groupedData.put("Week 4", BigDecimal.ZERO);
            groupedData.put("Week 5", BigDecimal.ZERO);
        } else if ("yearly".equalsIgnoreCase(period)) {
            startDate = now.withDayOfYear(1).with(LocalTime.MIN);
            endDate = now.with(java.time.temporal.TemporalAdjusters.lastDayOfYear()).with(LocalTime.MAX);
            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            for (String m : months) {
                groupedData.put(m, BigDecimal.ZERO);
            }
        } else {
            throw new IllegalArgumentException("Invalid period: " + period);
        }

        List<Payment> payments = paymentRepository.findByStatusAndCreatedAtBetween("PAID", startDate, endDate);

        BigDecimal totalSpending = BigDecimal.ZERO;
        long transactionCount = payments.size();

        for (Payment p : payments) {
            BigDecimal amount = p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO;
            totalSpending = totalSpending.add(amount);
            
            LocalDateTime date = p.getCreatedAt();
            if (date == null) continue;
            
            String key = "";
            if ("weekly".equalsIgnoreCase(period)) {
                key = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            } else if ("monthly".equalsIgnoreCase(period)) {
                int dayOfMonth = date.getDayOfMonth();
                if (dayOfMonth <= 7) key = "Week 1";
                else if (dayOfMonth <= 14) key = "Week 2";
                else if (dayOfMonth <= 21) key = "Week 3";
                else if (dayOfMonth <= 28) key = "Week 4";
                else key = "Week 5";
            } else if ("yearly".equalsIgnoreCase(period)) {
                key = date.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            }
            
            if (groupedData.containsKey(key)) {
                groupedData.put(key, groupedData.get(key).add(amount));
            }
        }

        BigDecimal averageSpending = BigDecimal.ZERO;
        if (transactionCount > 0) {
            averageSpending = totalSpending.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP);
        }

        List<SpendingAnalyticsDTO.DataPoint> dataPoints = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : groupedData.entrySet()) {
            dataPoints.add(SpendingAnalyticsDTO.DataPoint.builder()
                    .label(entry.getKey())
                    .amount(entry.getValue())
                    .build());
        }

        return SpendingAnalyticsDTO.builder()
                .period(period.toLowerCase())
                .totalSpending(totalSpending)
                .transactionCount(transactionCount)
                .averageSpending(averageSpending)
                .data(dataPoints)
                .build();
    }
}
