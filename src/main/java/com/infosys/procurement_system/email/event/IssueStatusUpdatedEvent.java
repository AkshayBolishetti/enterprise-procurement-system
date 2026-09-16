package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Issue;
import lombok.Getter;

@Getter
public class IssueStatusUpdatedEvent {
    private final Issue issue;
    private final String previousStatus;
    private final String updatedBy;
    private final String adminRemarks;

    public IssueStatusUpdatedEvent(Issue issue, String previousStatus, String updatedBy, String adminRemarks) {
        this.issue = issue;
        this.previousStatus = previousStatus;
        this.updatedBy = updatedBy;
        this.adminRemarks = adminRemarks;
    }
}
