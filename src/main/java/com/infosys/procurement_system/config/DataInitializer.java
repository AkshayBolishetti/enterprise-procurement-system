package com.infosys.procurement_system.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE departments DROP COLUMN manager_name");
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
