package com.infosys.procurement_system.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Slf4j
@Configuration
@EnableAsync
public class EmailConfiguration {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        log.info("Initializing EmailTaskExecutor thread pool...");
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(15);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("EmailThread-");
        executor.initialize();
        return executor;
    }
}
