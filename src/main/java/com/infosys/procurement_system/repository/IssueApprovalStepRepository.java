package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.IssueApprovalStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueApprovalStepRepository extends JpaRepository<IssueApprovalStep, Long> {
    List<IssueApprovalStep> findByIssueIdOrderByTimestampAsc(Long issueId);
}
