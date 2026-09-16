package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.dto.AdminIssueReviewRequestDTO;
import com.infosys.procurement_system.dto.IssueResponseDTO;
import com.infosys.procurement_system.enums.IssueStatus;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/issues")
@RequiredArgsConstructor
public class AdminIssueController {

    private final IssueService issueService;

    @PatchMapping("/{issueId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reviewIssue(
            @PathVariable Long issueId,
            @RequestBody AdminIssueReviewRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        IssueResponseDTO updated = issueService.reviewIssue(issueId, request.getStatus().name(), request.getReason(), userDetails.getUser());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);

        if (request.getStatus() == IssueStatus.APPROVED) {
            response.put("message", "Issue approved successfully");
        } else if (request.getStatus() == IssueStatus.REJECTED) {
            response.put("message", "Issue rejected successfully");
            response.put("reason", request.getReason());
        } else {
            response.put("message", "Issue status updated successfully");
        }

        response.put("issueId", updated.getId());
        response.put("status", request.getStatus().name());

        return ResponseEntity.ok(response);
    }
}
