package com.infosys.procurement_system.service;

import com.infosys.procurement_system.dto.DepartmentRequestDTO;
import com.infosys.procurement_system.dto.DepartmentResponseDTO;
import com.infosys.procurement_system.dto.RegisterRequestDto;
import com.infosys.procurement_system.dto.UserResponseDTO;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.exception.DuplicateResourceException;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RoleDepartmentAdminArchitectureTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserService userService;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Department engDept;
    private Department finDept;

    @BeforeEach
    void setUp() {
        engDept = departmentRepository.findByDepartmentName("Architecture Eng")
                .orElseGet(() -> {
                    DepartmentRequestDTO engDto = new DepartmentRequestDTO();
                    engDto.setDepartmentName("Architecture Eng");
                    DepartmentResponseDTO resp = departmentService.createDepartment(engDto);
                    return departmentRepository.findById(resp.getId()).orElseThrow();
                });

        finDept = departmentRepository.findByDepartmentName("Architecture Fin")
                .orElseGet(() -> {
                    DepartmentRequestDTO finDto = new DepartmentRequestDTO();
                    finDto.setDepartmentName("Architecture Fin");
                    DepartmentResponseDTO resp = departmentService.createDepartment(finDto);
                    return departmentRepository.findById(resp.getId()).orElseThrow();
                });
    }

    @Test
    @DisplayName("ADMIN requires department - Null department registration fails")
    void testAdminRequiresDepartment() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setEmployeeId("ADM-NO-DEPT");
        dto.setName("No Dept Admin");
        dto.setEmail("nodept@test.com");
        dto.setPassword("password123");
        dto.setRole(Role.ADMIN);
        dto.setDepartmentId(null);

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
    }

    @Test
    @DisplayName("No Global Admin allowed in system - department == null is rejected")
    void testNoGlobalAdminAllowed() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setEmployeeId("GLOBAL-ADMIN");
        dto.setName("Global Admin");
        dto.setEmail("global@test.com");
        dto.setPassword("password123");
        dto.setRole(Role.ADMIN);
        dto.setDepartmentId(null);

        assertThrows(IllegalArgumentException.class, () -> authService.register(dto));
    }

    @Test
    @DisplayName("Admin Registration for department with no admin succeeds")
    void testAdminRegistrationForNewDepartmentSucceeds() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setEmployeeId("ENG-ADM-01");
        dto.setName("Eng Admin One");
        dto.setEmail("engadmin1@test.com");
        dto.setPassword("password123");
        dto.setRole(Role.ADMIN);
        dto.setDepartmentId(engDept.getId());

        var resp = authService.register(dto);
        assertNotNull(resp);
        assertEquals(Role.ADMIN, resp.getRole());
        assertEquals("Architecture Eng", resp.getDepartmentName());
    }

    @Test
    @DisplayName("Second Admin registration for same department fails with 409 DuplicateResourceException")
    void testSecondAdminRegistrationRejected() {
        RegisterRequestDto dto1 = new RegisterRequestDto();
        dto1.setEmployeeId("ENG-ADM-10");
        dto1.setName("First Admin");
        dto1.setEmail("admin10@eng.com");
        dto1.setPassword("password123");
        dto1.setRole(Role.ADMIN);
        dto1.setDepartmentId(engDept.getId());
        authService.register(dto1);

        RegisterRequestDto dto2 = new RegisterRequestDto();
        dto2.setEmployeeId("ENG-ADM-11");
        dto2.setName("Second Admin Attempt");
        dto2.setEmail("admin11@eng.com");
        dto2.setPassword("password123");
        dto2.setRole(Role.ADMIN);
        dto2.setDepartmentId(engDept.getId());

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> authService.register(dto2));
        assertTrue(ex.getMessage().contains("This department already has an admin"));
    }

    @Test
    @DisplayName("Department Admin Isolation - Admin can only view users in their own department")
    void testDepartmentAdminIsolation() {
        // Register Eng Admin & Employee
        RegisterRequestDto engAdminDto = new RegisterRequestDto();
        engAdminDto.setEmployeeId("ENG-ADM-99");
        engAdminDto.setName("Eng Admin");
        engAdminDto.setEmail("admin99@eng.com");
        engAdminDto.setPassword("password123");
        engAdminDto.setRole(Role.ADMIN);
        engAdminDto.setDepartmentId(engDept.getId());
        authService.register(engAdminDto);

        RegisterRequestDto engEmpDto = new RegisterRequestDto();
        engEmpDto.setEmployeeId("ENG-EMP-99");
        engEmpDto.setName("Eng Emp");
        engEmpDto.setEmail("emp99@eng.com");
        engEmpDto.setPassword("password123");
        engEmpDto.setRole(Role.EMPLOYEE);
        engEmpDto.setDepartmentId(engDept.getId());
        authService.register(engEmpDto);

        // Register Fin Admin & Employee
        RegisterRequestDto finAdminDto = new RegisterRequestDto();
        finAdminDto.setEmployeeId("FIN-ADM-99");
        finAdminDto.setName("Fin Admin");
        finAdminDto.setEmail("admin99@fin.com");
        finAdminDto.setPassword("password123");
        finAdminDto.setRole(Role.ADMIN);
        finAdminDto.setDepartmentId(finDept.getId());
        authService.register(finAdminDto);

        User engAdminUser = userRepository.findByEmail("admin99@eng.com").orElseThrow();

        // Get users as Eng Admin
        List<UserResponseDTO> engUsers = userService.getAllUsers(engAdminUser);
        assertFalse(engUsers.isEmpty());
        assertTrue(engUsers.stream().allMatch(u -> "Architecture Eng".equals(u.getDepartmentName())));
    }
}
