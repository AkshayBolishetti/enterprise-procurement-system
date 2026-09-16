package com.infosys.procurement_system.dto;

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
public class UserDashboardDTO {

    private long totalMyRequests;
    private long pendingMyRequests;
    private long approvedMyRequests;
    private long totalMyIssues;
    private long openMyIssues;
    private long resolvedMyIssues;
    private long closedMyIssues;
    private long myOrders;
}
