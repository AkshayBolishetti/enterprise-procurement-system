package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admin_payment_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPaymentSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false, unique = true)
    private User admin;

    @Column(name = "hashed_mpin", length = 255)
    private String hashedMpin; // e.g., bcrypt hash of the 4-digit UPI MPIN

    @Builder.Default
    @OneToMany(mappedBy = "adminPaymentSetting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SavedCard> savedCards = new ArrayList<>();
}
