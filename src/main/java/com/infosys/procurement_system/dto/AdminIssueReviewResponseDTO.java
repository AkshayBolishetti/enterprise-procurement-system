package com.infosys.procurement_system.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.infosys.procurement_system.enums.IssueStatus;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"success", "message", "issueId", "status", "reason"})
public class AdminIssueReviewResponseDTO {

    private boolean success;
    private String message;
    private Long issueId;
    private IssueStatus status;
    private String reason;
}
