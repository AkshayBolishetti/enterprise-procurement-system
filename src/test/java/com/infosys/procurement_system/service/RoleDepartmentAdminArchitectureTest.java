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
        // Clean up any ADMIN users left over from other tests
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        userRepository.deleteAll(admins);

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
    @DisplayName("Admin does not require department - Registration succeeds")
    void testAdminDoesNotRequireDepartment() {
        RegisterRequestDto dto = new RegisterRequestDto();
        dto.setEmployeeId("GLOBAL-ADMIN");
        dto.setName("Global Admin");
        dto.setEmail("global@test.com");
        dto.setPassword("password123");
        dto.setRole(Role.ADMIN);
        dto.setDepartmentId(null);

        var resp = authService.register(dto);
        assertNotNull(resp);
        assertEquals(Role.ADMIN, resp.getRole());
        assertNull(resp.getDepartmentName());
    }

    @Test
    @DisplayName("Second Admin registration is rejected across entire system")
    void testSecondAdminRegistrationRejected() {
        RegisterRequestDto dto1 = new RegisterRequestDto();
        dto1.setEmployeeId("FIRST-ADMIN");
        dto1.setName("First Admin");
        dto1.setEmail("admin1@test.com");
        dto1.setPassword("password123");
        dto1.setRole(Role.ADMIN);
        dto1.setDepartmentId(null);
        authService.register(dto1);

        RegisterRequestDto dto2 = new RegisterRequestDto();
        dto2.setEmployeeId("SECOND-ADMIN");
        dto2.setName("Second Admin Attempt");
        dto2.setEmail("admin2@test.com");
        dto2.setPassword("password123");
        dto2.setRole(Role.ADMIN);
        dto2.setDepartmentId(null);

        DuplicateResourceException ex = assertThrows(DuplicateResourceException.class, () -> authService.register(dto2));
        assertTrue(ex.getMessage().contains("An admin account already exists"));
    }

    @Test
    @DisplayName("Global Admin can view all users in the system")
    void testGlobalAdminCanViewAllUsers() {
        // Register Global Admin
        RegisterRequestDto adminDto = new RegisterRequestDto();
        adminDto.setEmployeeId("GLOBAL-ADM-99");
        adminDto.setName("Global Admin");
        adminDto.setEmail("admin99@global.com");
        adminDto.setPassword("password123");
        adminDto.setRole(Role.ADMIN);
        adminDto.setDepartmentId(null);
        authService.register(adminDto);

        // Register Eng Employee
        RegisterRequestDto engEmpDto = new RegisterRequestDto();
        engEmpDto.setEmployeeId("ENG-EMP-99");
        engEmpDto.setName("Eng Emp");
        engEmpDto.setEmail("emp99@eng.com");
        engEmpDto.setPassword("password123");
        engEmpDto.setRole(Role.EMPLOYEE);
        engEmpDto.setDepartmentId(engDept.getId());
        authService.register(engEmpDto);

        // Register Fin Employee
        RegisterRequestDto finEmpDto = new RegisterRequestDto();
        finEmpDto.setEmployeeId("FIN-EMP-99");
        finEmpDto.setName("Fin Emp");
        finEmpDto.setEmail("emp99@fin.com");
        finEmpDto.setPassword("password123");
        finEmpDto.setRole(Role.EMPLOYEE);
        finEmpDto.setDepartmentId(finDept.getId());
        authService.register(finEmpDto);

        User globalAdminUser = userRepository.findByEmail("admin99@global.com").orElseThrow();

        // Get users as Global Admin
        List<UserResponseDTO> allUsers = userService.getAllUsers(globalAdminUser);
        
        // Admin should see themselves + 2 employees at least
        assertTrue(allUsers.size() >= 3);
        assertTrue(allUsers.stream().anyMatch(u -> "eng99@eng.com".equals(u.getEmail()) || "emp99@eng.com".equals(u.getEmail())));
        assertTrue(allUsers.stream().anyMatch(u -> "emp99@fin.com".equals(u.getEmail())));
    }
}
