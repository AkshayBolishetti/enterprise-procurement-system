package com.infosys.procurement_system.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.procurement_system.dto.AdminIssueReviewRequestDTO;
import com.infosys.procurement_system.entity.Department;
import com.infosys.procurement_system.entity.Issue;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.IssuePriority;
import com.infosys.procurement_system.enums.IssueStatus;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import com.infosys.procurement_system.repository.DepartmentRepository;
import com.infosys.procurement_system.repository.IssueRepository;
import com.infosys.procurement_system.repository.UserRepository;
import com.infosys.procurement_system.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class AdminIssueControllerTest {

        @Autowired
        private WebApplicationContext context;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private DepartmentRepository departmentRepository;

        @Autowired
        private IssueRepository issueRepository;

        private MockMvc mockMvc;
        private final ObjectMapper objectMapper = new ObjectMapper();

        private User adminUser;
        private User employeeUser;
        private Issue openIssue;
        private Issue approvedIssue;

        @BeforeEach
        void setUp() {
                mockMvc = MockMvcBuilders
                                .webAppContextSetup(context)
                                .apply(springSecurity())
                                .build();

                Department dept = Department.builder()
                                .departmentName("IT-" + System.currentTimeMillis())
                                .build();
                dept = departmentRepository.save(dept);

                adminUser = User.builder()
                                .employeeId("ADM-" + System.currentTimeMillis())
                                .name("Admin User")
                                .email("admin_" + System.currentTimeMillis() + "@test.com")
                                .password("password123")
                                .role(Role.ADMIN)
                                .status(UserStatus.ACTIVE)
                                .department(dept)
                                .build();
                adminUser = userRepository.save(adminUser);

                employeeUser = User.builder()
                                .employeeId("EMP-" + System.currentTimeMillis())
                                .name("Employee User")
                                .email("emp_" + System.currentTimeMillis() + "@test.com")
                                .password("password123")
                                .role(Role.EMPLOYEE)
                                .status(UserStatus.ACTIVE)
                                .department(dept)
                                .build();
                employeeUser = userRepository.save(employeeUser);

                openIssue = Issue.builder()
                                .issueNumber("ISS-OPEN-" + System.currentTimeMillis())
                                .title("Software license issue")
                                .description("Need IntelliJ license key renewal")
                                .priority(IssuePriority.HIGH)
                                .status(IssueStatus.OPEN)
                                .createdBy(employeeUser)
                                .build();
                openIssue = issueRepository.save(openIssue);

                approvedIssue = Issue.builder()
                                .issueNumber("ISS-APP-" + System.currentTimeMillis())
                                .title("Hardware replacement issue")
                                .description("Need replacement monitor")
                                .priority(IssuePriority.MEDIUM)
                                .status(IssueStatus.APPROVED)
                                .createdBy(employeeUser)
                                .reviewedBy(adminUser)
                                .build();
                approvedIssue = issueRepository.save(approvedIssue);
        }

        @Test
        @DisplayName("1. Admin approves an issue successfully")
        void adminApprovesIssueSuccessfully() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.APPROVED)
                                .reason("Issue verified and approved")
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", openIssue.getId())
                                .with(user(new CustomUserDetails(adminUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success", is(true)))
                                .andExpect(jsonPath("$.message", is("Issue approved successfully")))
                                .andExpect(jsonPath("$.issueId", is(openIssue.getId().intValue())))
                                .andExpect(jsonPath("$.status", is("APPROVED")))
                                .andExpect(jsonPath("$.reason").doesNotExist());
        }

        @Test
        @DisplayName("2. Admin rejects an issue with a valid reason")
        void adminRejectsIssueWithReason() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.REJECTED)
                                .reason("Insufficient justification provided for license renewal.")
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", openIssue.getId())
                                .with(user(new CustomUserDetails(adminUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success", is(true)))
                                .andExpect(jsonPath("$.message", is("Issue rejected successfully")))
                                .andExpect(jsonPath("$.issueId", is(openIssue.getId().intValue())))
                                .andExpect(jsonPath("$.status", is("REJECTED")))
                                .andExpect(jsonPath("$.reason",
                                                is("Insufficient justification provided for license renewal.")));
        }

        @Test
        @DisplayName("3. Rejection without a reason fails with 400 Bad Request")
        void rejectionWithoutReasonFails() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.REJECTED)
                                .reason("   ")
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", openIssue.getId())
                                .with(user(new CustomUserDetails(adminUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success", is(false)))
                                .andExpect(jsonPath("$.message",
                                                is("Rejection reason is required when rejecting an issue")));
        }

        @Test
        @DisplayName("4. Non-admin user receives 403 Forbidden")
        void nonAdminUserReceivesForbidden() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.APPROVED)
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", openIssue.getId())
                                .with(user(new CustomUserDetails(employeeUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("5. Unauthenticated user receives 401 Unauthorized")
        void unauthenticatedUserReceivesUnauthorized() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.APPROVED)
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", openIssue.getId())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("6. Non-existent issue returns 404 Not Found")
        void nonExistentIssueReturnsNotFound() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.APPROVED)
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", 999999L)
                                .with(user(new CustomUserDetails(adminUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.success", is(false)));
        }

        @Test
        @DisplayName("7. Already reviewed issue returns 409 Conflict")
        void alreadyReviewedIssueReturnsConflict() throws Exception {
                AdminIssueReviewRequestDTO request = AdminIssueReviewRequestDTO.builder()
                                .status(IssueStatus.APPROVED)
                                .build();

                mockMvc.perform(patch("/api/admin/issues/{issueId}/status", approvedIssue.getId())
                                .with(user(new CustomUserDetails(adminUser)))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.success", is(false)))
                                .andExpect(jsonPath("$.message", is("Issue has already been reviewed")));
        }
}
