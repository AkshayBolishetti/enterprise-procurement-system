package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Issue;
import lombok.Getter;

@Getter
public class IssueClosedEvent {
    private final Issue issue;
    private final String closedBy;
    private final String resolutionSummary;

    public IssueClosedEvent(Issue issue, String closedBy, String resolutionSummary) {
        this.issue = issue;
        this.closedBy = closedBy;
        this.resolutionSummary = resolutionSummary;
    }
}
