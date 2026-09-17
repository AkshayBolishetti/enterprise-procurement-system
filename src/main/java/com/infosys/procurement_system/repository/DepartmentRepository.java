package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByDepartmentName(String departmentName);

    boolean existsByDepartmentNameAndIdNot(String departmentName, Long id);

    Optional<Department> findByDepartmentName(String departmentName);




}
