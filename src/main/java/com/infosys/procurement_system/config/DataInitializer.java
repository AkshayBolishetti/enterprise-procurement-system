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



        log.info("System initialized.");
    }
}
