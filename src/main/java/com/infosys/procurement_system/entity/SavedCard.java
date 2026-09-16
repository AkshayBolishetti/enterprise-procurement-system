package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "saved_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedCard extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_payment_setting_id", nullable = false)
    private AdminPaymentSetting adminPaymentSetting;

    @NotBlank(message = "Cardholder name is required")
    @Column(name = "cardholder_name", nullable = false, length = 100)
    private String cardholderName;

    @NotBlank(message = "Masked number is required")
    @Column(name = "masked_number", nullable = false, length = 20)
    private String maskedNumber; // e.g., "•••• •••• •••• 4521"

    @NotBlank(message = "Card PIN is required")
    @Column(name = "hashed_pin", nullable = false, length = 255)
    private String hashedPin;
}
