package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"department"})
    List<User> findAll();

    @EntityGraph(attributePaths = {"department"})
    Optional<User> findById(Long id);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByEmployeeId(String employeeId);

    boolean existsByEmployeeIdAndIdNot(String employeeId, Long id);

    @EntityGraph(attributePaths = {"department"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"department"})
    Optional<User> findByEmailOrEmployeeId(String email, String employeeId);

    boolean existsByRole(Role role);

    boolean existsByRoleAndIdNot(Role role, Long id);

    long countByRoleAndDepartmentIsNull(Role role);

    boolean existsByRoleAndDepartmentIsNull(Role role);

    boolean existsByRoleAndDepartmentIsNullAndIdNot(Role role, Long id);

    long countByRoleAndDepartmentId(Role role, Long departmentId);

    long countByRoleAndDepartmentIdAndIdNot(Role role, Long departmentId, Long id);

    @EntityGraph(attributePaths = {"department"})
    List<User> findByRole(Role role);

    @EntityGraph(attributePaths = {"department"})
    List<User> findByDepartmentId(Long departmentId);

    @EntityGraph(attributePaths = {"department"})
    Optional<User> findByDepartmentIdAndRole(Long departmentId, Role role);

    List<User> findBySupplierId(Long supplierId);
}
