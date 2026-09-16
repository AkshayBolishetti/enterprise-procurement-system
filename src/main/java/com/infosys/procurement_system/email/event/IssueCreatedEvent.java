package com.infosys.procurement_system.email.event;

import com.infosys.procurement_system.entity.Issue;
import lombok.Getter;

@Getter
public class IssueCreatedEvent {
    private final Issue issue;

    public IssueCreatedEvent(Issue issue) {
        this.issue = issue;
    }
}
