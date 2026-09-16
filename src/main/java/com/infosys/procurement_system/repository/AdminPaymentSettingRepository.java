package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.AdminPaymentSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminPaymentSettingRepository extends JpaRepository<AdminPaymentSetting, Long> {
    Optional<AdminPaymentSetting> findByAdminId(Long adminId);
}
