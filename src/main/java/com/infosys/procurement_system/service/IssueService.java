package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.IssueRequestDTO;
import com.infosys.procurement_system.dto.IssueResponseDTO;
import com.infosys.procurement_system.dto.IssueApprovalStepDTO;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.IssueStatus;
import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.repository.IssueRepository;
import com.infosys.procurement_system.repository.ProductRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.entity.Product;
import com.infosys.procurement_system.enums.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService; // Injected AuditService
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getAllIssues(String search, String status, Pageable pageable) {
        Specification<Issue> spec = createSpecification(search, status, null);
        return issueRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<IssueResponseDTO> getMyIssues(String search, String status, Pageable pageable, User currentUser) {
        Specification<Issue> spec = createSpecification(search, status, currentUser.getId());
        return issueRepository.findAll(spec, pageable).map(this::toDto);
    }

    private Specification<Issue> createSpecification(String search, String status, Long createdById) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchPattern);
                Predicate issueNumPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("issueNumber")), searchPattern);
                Predicate catPredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("category")), searchPattern);
                predicates.add(criteriaBuilder.or(titlePredicate, issueNumPredicate, catPredicate));
            }

            if (StringUtils.hasText(status) && !status.equalsIgnoreCase("ALL")) {
                try {
                    IssueStatus issueStatus = IssueStatus.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), issueStatus));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status filter: {}", status);
                }
            }

            if (createdById != null) {
                predicates.add(criteriaBuilder.equal(root.get("createdBy").get("id"), createdById));
            }

            // To avoid N+1 issues when returning pages, we can fetch createdBy if it's not a count query
            if (Long.class != query.getResultType()) {
                root.fetch("createdBy", jakarta.persistence.criteria.JoinType.LEFT);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Transactional(readOnly = true)
    public IssueResponseDTO getIssueById(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));
        return toDto(issue);
    }

    @Transactional
    public IssueResponseDTO createIssue(IssueRequestDTO requestDTO, User currentUser) {
        String issueNumber = "REQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Product product = null;
        java.math.BigDecimal totalPrice = java.math.BigDecimal.ZERO;
        if (requestDTO.getProductId() != null) {
            // Use pessimistic lock to prevent concurrent over-requests
            product = productRepository.findByIdForUpdate(requestDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", requestDTO.getProductId()));

            // Validate requested quantity against available stock
            int requestedQty = requestDTO.getRequestedQuantity() != null ? requestDTO.getRequestedQuantity() : 1;
            if (requestedQty > product.getAvailableQuantity()) {
                throw new IllegalArgumentException(
                        "Requested quantity (" + requestedQty + ") exceeds available stock (" + product.getAvailableQuantity() + ").");
            }

            if (product.getUnitPrice() != null && requestDTO.getRequestedQuantity() != null) {
                totalPrice = product.getUnitPrice().multiply(new java.math.BigDecimal(requestDTO.getRequestedQuantity()));
            }
        }

        Issue issue = Issue.builder()
                .issueNumber(issueNumber)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .priority(requestDTO.getPriority() != null ? requestDTO.getPriority() : IssuePriority.MEDIUM)
                .status(IssueStatus.PENDING)
                .requestedQuantity(requestDTO.getRequestedQuantity() != null ? requestDTO.getRequestedQuantity() : 1)
                .category(requestDTO.getCategory())
                .product(product)
                .deliveryAddress(requestDTO.getDeliveryAddress())
                .totalPrice(totalPrice)
                .createdBy(currentUser)
                .build();

        Issue saved = issueRepository.save(issue);
        log.info("Issue {} created by user {}", saved.getIssueNumber(), currentUser.getEmail());
        
        // Notify Admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(admin, "New Request Created", "Employee " + currentUser.getName() + " has submitted a new request: " + saved.getIssueNumber());
        }
        
        return toDto(saved);
    }

    @Transactional
    public IssueResponseDTO reviewIssue(Long id, String status, String rejectionReason, User reviewer) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", id));

        if (issue.getStatus() != IssueStatus.PENDING && issue.getStatus() != IssueStatus.OPEN) {
            throw new com.infosys.procurement_system.exception.ResourceAlreadyReviewedException("Issue has already been reviewed");
        }

        String oldStatus = issue.getStatus().name();
        IssueStatus newStatus = IssueStatus.valueOf(status.toUpperCase());
        
        if (newStatus == IssueStatus.REJECTED && !StringUtils.hasText(rejectionReason)) {
            throw new IllegalArgumentException("Rejection reason is required when rejecting an issue");
        }

        // Transition to PAYMENT_PENDING if APPROVED per requirements
        if (newStatus == IssueStatus.APPROVED) {
            newStatus = IssueStatus.PAYMENT_PENDING;
        }

        issue.setStatus(newStatus);
        issue.setReviewedBy(reviewer);
        issue.setReviewedAt(LocalDateTime.now());

        if (newStatus == IssueStatus.REJECTED && rejectionReason != null) {
            issue.setRejectionReason(rejectionReason);
        }

        if (newStatus == IssueStatus.RESOLVED || newStatus == IssueStatus.COMPLETED) {
            issue.setResolvedAt(LocalDateTime.now());
        }

        Issue saved = issueRepository.save(issue);
        
        // Audit log
        String remarks = "Issue reviewed and status changed to " + newStatus;
        if (newStatus == IssueStatus.REJECTED && StringUtils.hasText(rejectionReason)) {
            remarks += ". Reason: " + rejectionReason;
        }
        auditService.logIssueEvent(
                saved,
                "ISSUE_REVIEW",
                oldStatus,
                newStatus.name(),
                reviewer.getEmail(),
                remarks
        );

        log.info("Issue {} reviewed to status {} by {}", saved.getIssueNumber(), newStatus, reviewer.getEmail());
        return toDto(saved);
    }

    // Keep the existing getMyIssues and getAllIssues that return List to avoid breaking other internal usages?
    // Actually, I'll provide overloaded methods.
    @Transactional(readOnly = true)
    public List<IssueResponseDTO> getAllIssues() {
        return issueRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IssueResponseDTO> getMyIssues(User currentUser) {
        return issueRepository.findByCreatedById(currentUser.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private IssueResponseDTO toDto(Issue issue) {
        IssueResponseDTO.IssueResponseDTOBuilder builder = IssueResponseDTO.builder()
                .id(issue.getId())
                .issueNumber(issue.getIssueNumber())
                .title(issue.getTitle())
                .description(issue.getDescription())
                .priority(issue.getPriority())
                .requestedQuantity(issue.getRequestedQuantity())
                .category(issue.getCategory())
                .status(issue.getStatus())
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .resolvedAt(issue.getResolvedAt());

        if (issue.getCreatedBy() != null) {
            builder.createdById(issue.getCreatedBy().getId())
                    .createdByName(issue.getCreatedBy().getName())
                    .createdByEmail(issue.getCreatedBy().getEmail());
            if (issue.getCreatedBy().getDepartment() != null) {
                builder.departmentName(issue.getCreatedBy().getDepartment().getDepartmentName());
            }
        }

        if (issue.getProduct() != null) {
            builder.productId(issue.getProduct().getId())
                    .productName(issue.getProduct().getProductName());
        }
        
        builder.deliveryAddress(issue.getDeliveryAddress());
        builder.totalPrice(issue.getTotalPrice());

        if (issue.getApprovalSteps() != null && !issue.getApprovalSteps().isEmpty()) {
            builder.approvalSteps(issue.getApprovalSteps().stream()
                    .map(step -> IssueApprovalStepDTO.builder()
                            .id(step.getId())
                            .approvalRole(step.getApprovalRole())
                            .status(step.getStatus())
                            .approverId(step.getApprover() != null ? step.getApprover().getId() : null)
                            .approverName(step.getApprover() != null ? step.getApprover().getName() : null)
                            .timestamp(step.getTimestamp())
                            .remarks(step.getRemarks())
                            .build())
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
