package com.infosys.procurement_system.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderMessageDTO {
    private Long id;
    private Long purchaseOrderId;
    private Long senderId;
    private String senderName;
    private String message;
    private LocalDateTime timestamp;
}
