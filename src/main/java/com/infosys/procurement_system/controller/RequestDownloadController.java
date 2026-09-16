package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestDownloadController {

    private final com.infosys.procurement_system.repository.IssueRepository issueRepository;

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<String> downloadRequestsCsv(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        java.util.List<com.infosys.procurement_system.entity.Issue> approvedIssues;

        if (currentUser.getRole() == Role.ADMIN) {
            approvedIssues = issueRepository.findByStatus(com.infosys.procurement_system.enums.IssueStatus.APPROVED);
        } else {
            approvedIssues = issueRepository.findByCreatedByIdAndStatus(currentUser.getId(),
                    com.infosys.procurement_system.enums.IssueStatus.APPROVED);
        }

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Request ID,Issue Number,Title,Status\n");

        for (com.infosys.procurement_system.entity.Issue issue : approvedIssues) {
            csvBuilder.append(issue.getId()).append(",")
                    .append(escapeCsv(issue.getIssueNumber())).append(",")
                    .append(escapeCsv(issue.getTitle())).append(",")
                    .append(issue.getStatus()).append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"approved-requests.csv\"");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBuilder.toString());
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
