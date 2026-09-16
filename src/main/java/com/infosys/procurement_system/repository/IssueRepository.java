package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.enums.IssueStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long>, JpaSpecificationExecutor<Issue> {

    @EntityGraph(attributePaths = {"createdBy"})
    List<Issue> findAll();

    @EntityGraph(attributePaths = {"createdBy"})
    Optional<Issue> findById(Long id);

    @EntityGraph(attributePaths = {"createdBy"})
    Optional<Issue> findByIssueNumber(String issueNumber);

    @EntityGraph(attributePaths = {"createdBy"})
    List<Issue> findByCreatedById(Long userId);

    @EntityGraph(attributePaths = {"createdBy"})
    List<Issue> findByStatus(IssueStatus status);

    @EntityGraph(attributePaths = {"createdBy"})
    List<Issue> findByCreatedByIdAndStatus(Long userId, IssueStatus status);

    boolean existsByIssueNumber(String issueNumber);

    long countByStatus(IssueStatus status);

    long countByCreatedById(Long userId);

    long countByCreatedByIdAndStatus(Long userId, IssueStatus status);

    @Query("SELECT SUM(i.totalPrice) FROM Issue i WHERE i.status = :status")
    BigDecimal sumTotalPriceByStatus(@Param("status") IssueStatus status);
}
