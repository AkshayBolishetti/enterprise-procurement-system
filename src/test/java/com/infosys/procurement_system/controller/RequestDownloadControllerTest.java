package com.infosys.procurement_system.controller;

import com.infosys.procurement_system.entity.Category;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.enums.IssueStatus;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import com.infosys.procurement_system.repository.CategoryRepository;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.IssueRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class RequestDownloadControllerTest {

        @Autowired
        private WebApplicationContext context;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private DepartmentRepository departmentRepository;

        @Autowired
        private CategoryRepository categoryRepository;

        @Autowired
        private IssueRepository issueRepository;

        private MockMvc mockMvc;

        private User adminUser;
        private User userA;
        private User userB;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders
                                .webAppContextSetup(context)
                                .apply(springSecurity())
                                .build();

                long ts = System.currentTimeMillis();

                Department dept = Department.builder()
                                .departmentName("Engineering-" + ts)
                                .build();
                dept = departmentRepository.save(dept);

                Category category = Category.builder()
                                .categoryName("Hardware-" + ts)
                                .build();
                category = categoryRepository.save(category);

                adminUser = userRepository.save(User.builder()
                                .employeeId("ADM-" + ts)
                                .name("Admin User")
                                .email("admin_" + ts + "@test.com")
                                .password("password123")
                                .role(Role.ADMIN)
                                .status(UserStatus.ACTIVE)
                                .department(dept)
                                .build());

                userA = userRepository.save(User.builder()
                                .employeeId("USERA-" + ts)
                                .name("User A")
                                .email("usera_" + ts + "@test.com")
                                .password("password123")
                                .role(Role.EMPLOYEE)
                                .status(UserStatus.ACTIVE)
                                .department(dept)
                                .build());

                userB = userRepository.save(User.builder()
                                .employeeId("USERB-" + ts)
                                .name("User B")
                                .email("userb_" + ts + "@test.com")
                                .password("password123")
                                .role(Role.EMPLOYEE)
                                .status(UserStatus.ACTIVE)
                                .department(dept)
                                .build());

                issueRepository.save(Issue.builder()
                                .issueNumber("ISS-A-APP-" + ts)
                                .title("User A Approved Laptop")
                                .description("MacBook Pro for User A")
                                .category("Hardware-" + ts)
                                .requestedQuantity(1)
                                .priority(IssuePriority.MEDIUM)
                                .status(IssueStatus.APPROVED)
                                .createdBy(userA)
                                .build());

                issueRepository.save(Issue.builder()
                                .issueNumber("ISS-A-REJ-" + ts)
                                .title("User A Rejected Monitor")
                                .description("Gaming Monitor")
                                .category("Hardware-" + ts)
                                .requestedQuantity(1)
                                .priority(IssuePriority.MEDIUM)
                                .status(IssueStatus.REJECTED)
                                .createdBy(userA)
                                .build());

                issueRepository.save(Issue.builder()
                                .issueNumber("ISS-A-PEN-" + ts)
                                .title("User A Pending Mouse")
                                .description("Wireless Mouse")
                                .category("Hardware-" + ts)
                                .requestedQuantity(2)
                                .priority(IssuePriority.MEDIUM)
                                .status(IssueStatus.OPEN)
                                .createdBy(userA)
                                .build());

                issueRepository.save(Issue.builder()
                                .issueNumber("ISS-B-APP-" + ts)
                                .title("User B Approved Desk")
                                .description("Standing Desk for User B")
                                .category("Hardware-" + ts)
                                .requestedQuantity(1)
                                .priority(IssuePriority.MEDIUM)
                                .status(IssueStatus.APPROVED)
                                .createdBy(userB)
                                .build());
        }

        @Test
        @DisplayName("Admin receives CSV containing all approved requests from all users")
        void adminDownloadsAllApprovedRequestsCsv() throws Exception {
                MvcResult result = mockMvc.perform(get("/api/requests/download")
                                .with(user(new CustomUserDetails(adminUser))))
                                .andExpect(status().isOk())
                                .andExpect(header().string("Content-Type", "text/csv"))
                                .andExpect(header().string("Content-Disposition",
                                                "attachment; filename=\"approved-requests.csv\""))
                                .andReturn();

                String csvContent = result.getResponse().getContentAsString();

                assertTrue(csvContent.contains("User A Approved Laptop"));
                assertTrue(csvContent.contains("User B Approved Desk"));
                assertFalse(csvContent.contains("User A Rejected Monitor"));
                assertFalse(csvContent.contains("User A Pending Mouse"));
        }

        @Test
        @DisplayName("User A receives CSV containing only User A's approved requests")
        void userADownloadsOnlyOwnApprovedRequestsCsv() throws Exception {
                MvcResult result = mockMvc.perform(get("/api/requests/download")
                                .with(user(new CustomUserDetails(userA))))
                                .andExpect(status().isOk())
                                .andExpect(header().string("Content-Type", "text/csv"))
                                .andExpect(header().string("Content-Disposition",
                                                "attachment; filename=\"approved-requests.csv\""))
                                .andReturn();

                String csvContent = result.getResponse().getContentAsString();

                assertTrue(csvContent.contains("User A Approved Laptop"));
                assertFalse(csvContent.contains("User A Rejected Monitor"));
                assertFalse(csvContent.contains("User A Pending Mouse"));
                assertFalse(csvContent.contains("User B Approved Desk"));
        }

        @Test
        @DisplayName("User with no approved requests receives empty CSV with headers")
        void userWithNoApprovedRequestsReceivesHeaderOnlyCsv() throws Exception {
                User userWithoutApproved = userRepository.save(User.builder()
                                .employeeId("USERC-" + System.currentTimeMillis())
                                .name("User C")
                                .email("userc_" + System.currentTimeMillis() + "@test.com")
                                .password("password123")
                                .role(Role.EMPLOYEE)
                                .status(UserStatus.ACTIVE)
                                .department(adminUser.getDepartment())
                                .build());

                MvcResult result = mockMvc.perform(get("/api/requests/download")
                                .with(user(new CustomUserDetails(userWithoutApproved))))
                                .andExpect(status().isOk())
                                .andExpect(header().string("Content-Type", "text/csv"))
                                .andExpect(header().string("Content-Disposition",
                                                "attachment; filename=\"approved-requests.csv\""))
                                .andReturn();

                String csvContent = result.getResponse().getContentAsString();
                String[] lines = csvContent.trim().split("\n");

                assertEquals(1, lines.length, "CSV should contain only the header line");
        }

        @Test
        @DisplayName("Unauthenticated request returns 401 Unauthorized")
        void unauthenticatedRequestReturnsUnauthorized() throws Exception {
                mockMvc.perform(get("/api/requests/download"))
                                .andExpect(status().isUnauthorized());
        }
}
