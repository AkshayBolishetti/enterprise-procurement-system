package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.AuthResponseDTO;
import com.infosys.procurement_system.dto.LoginRequestDTO;
import com.infosys.procurement_system.dto.RegisterRequestDto;
import com.infosys.procurement_system.dto.SupplierRegisterRequestDto;
import com.infosys.procurement_system.email.event.UserRegisteredEvent;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.exception.ResourceNotFoundException;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.SupplierRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.security.CustomUserDetails;
import com.infosys.procurement_system.security.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDto requestDto) {
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new IllegalArgumentException("User with email " + requestDto.getEmail() + " already exists");
        }

        if (userRepository.existsByEmployeeId(requestDto.getEmployeeId())) {
            throw new IllegalArgumentException(
                    "User with employee ID " + requestDto.getEmployeeId() + " already exists");
        }

        Department department = null;
        if (requestDto.getDepartmentId() != null) {
            department = departmentRepository.findById(requestDto.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Department not found with ID: " + requestDto.getDepartmentId()));
        }

        Role role = requestDto.getRole() != null ? requestDto.getRole() : Role.EMPLOYEE;

        if (role == Role.ADMIN) {
            if (userRepository.existsByRole(Role.ADMIN)) {
                throw new DuplicateResourceException(
                        "An admin account already exists. Only one admin is allowed in the system.");
            }
        }

        User user = User.builder()
                .employeeId(requestDto.getEmployeeId())
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .phoneNumber(requestDto.getPhoneNumber())
                .designation(requestDto.getDesignation())
                .role(role)
                .status(UserStatus.ACTIVE)
                .department(department)
                .build();

        User savedUser = userRepository.save(user);



        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser));

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .id(savedUser.getId())
                .employeeId(savedUser.getEmployeeId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .departmentName(
                        savedUser.getDepartment() != null ? savedUser.getDepartment().getDepartmentName() : null)
                .message("User registered successfully")
                .token(token)
                .build();
    }

    @Transactional
    public AuthResponseDTO registerSupplier(SupplierRegisterRequestDto requestDto) {
        if (userRepository.existsByEmail(requestDto.getEmail())) {
            throw new IllegalArgumentException("User with email " + requestDto.getEmail() + " already exists");
        }

        if (userRepository.existsByEmployeeId(requestDto.getSupplierId())) {
            throw new IllegalArgumentException(
                    "Supplier ID " + requestDto.getSupplierId() + " already exists");
        }

        // Create Supplier entity first
        Supplier supplier = Supplier.builder()
                .supplierName(requestDto.getName())
                .email(requestDto.getEmail())
                .active(true)
                .build();
        supplier = supplierRepository.save(supplier);

        // Create User entity mapped to supplier
        User user = User.builder()
                .employeeId(requestDto.getSupplierId())
                .name(requestDto.getName())
                .email(requestDto.getEmail())
                .password(passwordEncoder.encode(requestDto.getPassword()))
                .role(Role.SUPPLIER)
                .status(UserStatus.ACTIVE)
                .supplier(supplier)
                .build();

        User savedUser = userRepository.save(user);

        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser));

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtUtils.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .id(savedUser.getId())
                .employeeId(savedUser.getEmployeeId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .message("Supplier registered successfully")
                .token(token)
                .build();
    }

    public AuthResponseDTO login(LoginRequestDTO requestDto, HttpServletRequest request, HttpServletResponse response) {
        UsernamePasswordAuthenticationToken authReq = new UsernamePasswordAuthenticationToken(requestDto.getEmail(),
                requestDto.getPassword());

        Authentication authentication = authenticationManager.authenticate(authReq);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String token = jwtUtils.generateToken(userDetails);

        return AuthResponseDTO.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .message("Login successful")
                .token(token)
                .build();
    }

    public AuthResponseDTO logout(HttpServletRequest request, HttpServletResponse response) {
        return AuthResponseDTO.builder()
                .message("Logged out successfully")
                .build();
    }

    public AuthResponseDTO me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("No authenticated user found in session");
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        return AuthResponseDTO.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .message("Authenticated user retrieved successfully")
                .build();
    }
}
