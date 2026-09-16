package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.DepartmentRequestDTO;
import com.infosys.procurement_system.dto.DepartmentResponseDTO;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.IllegalOperationException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.DepartmentMapper;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DepartmentMapper departmentMapper;

    @Transactional
    public DepartmentResponseDTO createDepartment(DepartmentRequestDTO requestDTO) {
        log.info("Creating department: {}", requestDTO.getDepartmentName());
        if (departmentRepository.existsByDepartmentName(requestDTO.getDepartmentName())) {
            throw new DuplicateResourceException("Department", "departmentName", requestDTO.getDepartmentName());
        }
        Department saved = departmentRepository.save(departmentMapper.toEntity(requestDTO));
        return departmentMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponseDTO getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(departmentMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
    }

    @Transactional
    public DepartmentResponseDTO updateDepartment(Long id, DepartmentRequestDTO requestDTO) {
        log.info("Updating department ID: {}", id);
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (departmentRepository.existsByDepartmentNameAndIdNot(requestDTO.getDepartmentName(), id)) {
            throw new DuplicateResourceException("Department", "departmentName", requestDTO.getDepartmentName());
        }

        departmentMapper.updateEntityFromDto(requestDTO, department);
        return departmentMapper.toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDTO assignAdmin(Long departmentId, Long userId) {
        log.info("Assigning admin user {} to department {}", userId, departmentId);
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));

        if (department.getAdmin() != null) {
            throw new DuplicateResourceException("This department already has an admin. You cannot register another admin for this department.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (departmentRepository.existsByAdminId(userId)) {
            throw new IllegalOperationException("User '" + user.getName() + "' is already an admin of another department.");
        }

        user.setRole(Role.ADMIN);
        user.setDepartment(department);
        userRepository.save(user);

        department.setAdmin(user);
        return departmentMapper.toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDTO assignDepartmentAdmin(Long departmentId, Long userId) {
        return assignAdmin(departmentId, userId);
    }

    @Transactional
    public DepartmentResponseDTO replaceAdmin(Long departmentId, Long newUserId) {
        log.info("Replacing admin for department {} with user {}", departmentId, newUserId);
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));

        User newUser = userRepository.findById(newUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", newUserId));

        User oldAdmin = department.getAdmin();
        if (oldAdmin != null && !oldAdmin.getId().equals(newUserId)) {
            oldAdmin.setRole(Role.EMPLOYEE);
            userRepository.save(oldAdmin);
        }

        newUser.setRole(Role.ADMIN);
        newUser.setDepartment(department);
        userRepository.save(newUser);

        department.setAdmin(newUser);
        return departmentMapper.toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDTO replaceDepartmentAdmin(Long departmentId, Long newUserId) {
        return replaceAdmin(departmentId, newUserId);
    }

    @Transactional
    public DepartmentResponseDTO removeAdmin(Long departmentId) {
        log.info("Removing admin for department {}", departmentId);
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", departmentId));

        User oldAdmin = department.getAdmin();
        if (oldAdmin != null) {
            oldAdmin.setRole(Role.EMPLOYEE);
            userRepository.save(oldAdmin);
        }

        department.setAdmin(null);
        return departmentMapper.toDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponseDTO removeDepartmentAdmin(Long departmentId) {
        return removeAdmin(departmentId);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        boolean hasReferences = (department.getUsers() != null && !department.getUsers().isEmpty());

        if (hasReferences) {
            throw new IllegalOperationException("Department '" + department.getDepartmentName() + "' cannot be deleted as it is referenced by users.");
        }
        throw new IllegalOperationException("Department is organizational master lookup data and cannot be deleted.");
    }
}
