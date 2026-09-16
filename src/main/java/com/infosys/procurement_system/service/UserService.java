package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.UserRequestDTO;
import com.infosys.procurement_system.dto.UserResponseDTO;
import com.infosys.procurement_system.email.event.UserRegisteredEvent;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.IllegalOperationException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.mapper.UserMapper;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        log.info("Creating user email: {}", requestDTO.getEmail());
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new DuplicateResourceException("User", "email", requestDTO.getEmail());
        }
        if (userRepository.existsByEmployeeId(requestDTO.getEmployeeId())) {
            throw new DuplicateResourceException("User", "employeeId", requestDTO.getEmployeeId());
        }

        Role role = requestDTO.getRole() != null ? requestDTO.getRole() : Role.EMPLOYEE;

        Department department = null;
        if (requestDTO.getDepartmentId() != null) {
            department = departmentRepository.findById(requestDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDTO.getDepartmentId()));
        }

        if (role != Role.ADMIN && requestDTO.getDepartmentId() == null) {
            throw new IllegalArgumentException("Department ID is mandatory for non-admin users.");
        }

        if (role == Role.ADMIN) {
            if (userRepository.countByRoleAndDepartmentId(Role.ADMIN, department.getId()) > 0 || department.getAdmin() != null) {
                throw new DuplicateResourceException("This department already has an admin. You cannot register another admin for this department.");
            }
        }

        User user = userMapper.toEntity(requestDTO, department);
        user.setRole(role);
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User saved = userRepository.save(user);
        if (role == Role.ADMIN && department != null) {
            department.setAdmin(saved);
            departmentRepository.save(department);
        }
        eventPublisher.publishEvent(new UserRegisteredEvent(saved));
        return userMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return getAllUsers(null);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers(User currentUser) {
        if (currentUser != null && currentUser.getRole() == Role.ADMIN && currentUser.getDepartment() != null) {
            Long deptId = currentUser.getDepartment().getId();
            return userRepository.findByDepartmentId(deptId).stream()
                    .map(userMapper::toDto)
                    .toList();
        }
        return userRepository.findAll().stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {
        log.info("Updating user ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (userRepository.existsByEmailAndIdNot(requestDTO.getEmail(), id)) {
            throw new DuplicateResourceException("User", "email", requestDTO.getEmail());
        }
        if (userRepository.existsByEmployeeIdAndIdNot(requestDTO.getEmployeeId(), id)) {
            throw new DuplicateResourceException("User", "employeeId", requestDTO.getEmployeeId());
        }

        Role role = requestDTO.getRole() != null ? requestDTO.getRole() : Role.EMPLOYEE;

        Department department = null;
        if (requestDTO.getDepartmentId() != null) {
            department = departmentRepository.findById(requestDTO.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", requestDTO.getDepartmentId()));
        }

        if (role != Role.ADMIN && requestDTO.getDepartmentId() == null) {
            throw new IllegalArgumentException("Department ID is mandatory for non-admin users.");
        }

        if (role == Role.ADMIN) {
            if (userRepository.countByRoleAndDepartmentIdAndIdNot(Role.ADMIN, department.getId(), id) > 0) {
                throw new DuplicateResourceException("This department already has an admin. You cannot register another admin for this department.");
            }
        }

        userMapper.updateEntityFromDto(requestDTO, user, department);
        user.setRole(role);
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isBlank()
                && !requestDTO.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        if (role == Role.ADMIN && department != null) {
            department.setAdmin(updatedUser);
            departmentRepository.save(department);
        }
        return userMapper.toDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        log.info("Deleting user ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getCreatedIssues() != null && !user.getCreatedIssues().isEmpty()) {
            throw new IllegalOperationException("User '" + user.getName()
                    + "' cannot be deleted because procurement issues are associated with this user.");
        }
        userRepository.delete(user);
    }
}
