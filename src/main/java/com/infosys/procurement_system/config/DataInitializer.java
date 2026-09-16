package com.infosys.procurement_system.config;

import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.enums.Role;
import com.infosys.procurement_system.enums.UserStatus;
import com.infosys.procurement_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE departments MODIFY COLUMN manager_name VARCHAR(100) NULL");
        } catch (Exception e) {
            log.debug("Schema adjustment for manager_name nullability: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE departments ADD COLUMN IF NOT EXISTS admin_id BIGINT NULL");
        } catch (Exception e) {
            log.debug("Schema adjustment for admin_id column: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE purchase_orders DROP COLUMN category_id");
        } catch (Exception e) {
            log.debug("Schema adjustment for dropping category_id: {}", e.getMessage());
        }

        // Bootstrap Initial Admin
        if (!userRepository.existsByRole(Role.ADMIN)) {
            log.info("No ADMIN found in the system. Bootstrapping initial admin...");
            
            String adminEmail = env.getProperty("APP_ADMIN_EMAIL");
            String adminPassword = env.getProperty("APP_ADMIN_PASSWORD");
            
            if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
                throw new IllegalStateException("Cannot bootstrap admin: APP_ADMIN_EMAIL or APP_ADMIN_PASSWORD environment variables are missing.");
            }
            
            User admin = User.builder()
                    .employeeId("ADMIN-001")
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .department(null)
                    .build();
            
            userRepository.save(admin);
            log.info("Successfully bootstrapped initial admin with email: {}", adminEmail);
        }

        log.info("System initialized.");
    }
}
