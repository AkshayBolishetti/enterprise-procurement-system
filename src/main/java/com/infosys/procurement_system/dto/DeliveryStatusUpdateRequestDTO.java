package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryStatusUpdateRequestDTO {

    @NotNull(message = "Delivery status is mandatory")
    private DeliveryStatus status;

    private String carrier;

    private String trackingNumber;

    private String notes;
}
