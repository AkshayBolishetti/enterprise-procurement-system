package com.infosys.procurement_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "Category is mandatory")
    @Column(name = "category", nullable = false, length = 30)
    private String category; // BUG, FEATURE, GENERAL

    @NotNull(message = "Notes are mandatory")
    @Column(name = "notes", nullable = false, columnDefinition = "TEXT")
    private String notes;

}
