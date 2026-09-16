package com.infosys.procurement_system.config;

import com.infosys.procurement_system.entity.Supplier;
import com.infosys.procurement_system.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupplierDataInitializer implements CommandLineRunner {

    private final SupplierRepository supplierRepository;

    @Override
    public void run(String... args) {
        if (supplierRepository.count() == 0) {
            Supplier defaultSupplier = Supplier.builder()
                    .supplierName("Global Procurement Supplier")
                    .email("supplier@procurement-system.com")
                    .phone("+1-800-555-0199")
                    .address("100 Corporate HQ, Logistics Way")
                    .gstNumber("GST29ABCDE1234F1Z5")
                    .active(true)
                    .rating(4.8)
                    .build();
            supplierRepository.save(defaultSupplier);
            log.info("Initialized default single supplier: {}", defaultSupplier.getSupplierName());
        }
    }
}
