package com.infosys.procurement_system.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FinancialService {

    /**
     * Calculates the subtotal for a given unit price and quantity.
     * @param unitPrice The price per unit
     * @param quantity The quantity
     * @return The calculated subtotal
     */
    public BigDecimal calculateSubtotal(BigDecimal unitPrice, Integer quantity) {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the GST amount based on the subtotal and GST rate.
     * @param subtotal The subtotal amount
     * @param gstRate The GST rate percentage (e.g., 18 for 18%)
     * @return The calculated GST amount
     */
    public BigDecimal calculateGstAmount(BigDecimal subtotal, BigDecimal gstRate) {
        if (subtotal == null || gstRate == null) {
            return BigDecimal.ZERO;
        }
        return subtotal.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the total amount (subtotal + GST amount).
     * @param subtotal The subtotal amount
     * @param gstAmount The calculated GST amount
     * @return The total amount
     */
    public BigDecimal calculateTotalAmount(BigDecimal subtotal, BigDecimal gstAmount) {
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (gstAmount == null) gstAmount = BigDecimal.ZERO;
        return subtotal.add(gstAmount).setScale(2, RoundingMode.HALF_UP);
    }
}
