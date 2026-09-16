package com.infosys.procurement_system.dto;

import com.infosys.procurement_system.enums.IssuePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class IssueRequestDTO {

    @NotBlank(message = "Title is mandatory")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @NotBlank(message = "Description is mandatory")
    private String description;

    private IssuePriority priority;

    @jakarta.validation.constraints.NotNull(message = "Requested quantity is mandatory")
    @jakarta.validation.constraints.Positive(message = "Requested quantity must be greater than zero")
    private Integer requestedQuantity;

    private String category;

    private Long productId;

    private String deliveryAddress;
}
