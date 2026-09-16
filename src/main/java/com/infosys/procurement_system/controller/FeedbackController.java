package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.common.ApiResponse;
import com.infosys.procurement_system.entity.Feedback;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitFeedback(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Feedback feedback = Feedback.builder()
                .user(userDetails.getUser())
                .category(payload.get("category"))
                .notes(payload.get("notes"))
                .build();
        
        feedbackRepository.save(feedback);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted successfully"));
    }
}
