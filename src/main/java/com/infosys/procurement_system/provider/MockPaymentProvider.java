package com.infosys.procurement_system.provider;

import com.infosys.procurement_system.enums.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Component
public class MockPaymentProvider implements PaymentProvider {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    public PaymentResult processPayment(PaymentProcessCommand command) {
        log.info("Processing mock payment for Request ID: {}, Amount: {} {}", 
                command.getRequestId(), command.getAmount(), command.getCurrency());

        // Generate secure transaction reference: PAY-YYYYMMDDHHMMSS-UUID8
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String transactionRef = "PAY-" + dateStr + "-" + randomSuffix;

        // Mock payment logic: succeed by default unless mock failure condition is specified
        log.info("Mock payment completed successfully with reference: {}", transactionRef);
        return PaymentResult.builder()
                .success(true)
                .status(PaymentStatus.SUCCESS)
                .transactionReference(transactionRef)
                .failureReason(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
