package com.infosys.procurement_system.service;

import com.infosys.procurement_system.entity.AdminPaymentSetting;
import com.infosys.procurement_system.entity.SavedCard;
import com.infosys.procurement_system.entity.User;
import com.infosys.procurement_system.repository.AdminPaymentSettingRepository;
import com.infosys.procurement_system.repository.SavedCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminPaymentService {

    private final AdminPaymentSettingRepository adminPaymentSettingRepository;
    private final SavedCardRepository savedCardRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public void setupMpin(User admin, String mpin) {
        if (mpin == null || !mpin.matches("\\d{4}")) {
            throw new IllegalArgumentException("MPIN must be exactly 4 digits");
        }
        
        AdminPaymentSetting setting = adminPaymentSettingRepository.findByAdminId(admin.getId())
                .orElse(AdminPaymentSetting.builder().admin(admin).build());
        
        setting.setHashedMpin(passwordEncoder.encode(mpin));
        adminPaymentSettingRepository.save(setting);
    }

    @Transactional(readOnly = true)
    public boolean verifyMpin(User admin, String mpin) {
        AdminPaymentSetting setting = adminPaymentSettingRepository.findByAdminId(admin.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment settings are not configured for this Admin."));
        if (setting.getHashedMpin() == null) {
            throw new IllegalArgumentException("Payment settings are not configured for this Admin.");
        }
        if (!passwordEncoder.matches(mpin, setting.getHashedMpin())) {
            throw new SecurityException("Invalid payment PIN/MPIN.");
        }
        return true;
    }

    @Transactional(readOnly = true)
    public boolean hasMpin(User admin) {
        Optional<AdminPaymentSetting> setting = adminPaymentSettingRepository.findByAdminId(admin.getId());
        return setting.isPresent() && setting.get().getHashedMpin() != null;
    }

    @Transactional
    public void changeMpin(User admin, String currentMpin, String newMpin) {
        if (!verifyMpin(admin, currentMpin)) {
            throw new SecurityException("Current MPIN is incorrect");
        }
        setupMpin(admin, newMpin);
    }

    @Transactional
    public void addSavedCard(User admin, String cardholderName, String cardNumber, String cardPin) {
        if (cardPin == null || !cardPin.matches("\\d{4}")) {
            throw new IllegalArgumentException("Card PIN must be exactly 4 digits");
        }

        AdminPaymentSetting setting = adminPaymentSettingRepository.findByAdminId(admin.getId())
                .orElse(AdminPaymentSetting.builder().admin(admin).build());
        adminPaymentSettingRepository.save(setting); // Ensure it's saved before linking

        String maskedNumber = "•••• •••• •••• " + (cardNumber.length() >= 4 ? cardNumber.substring(cardNumber.length() - 4) : "XXXX");

        SavedCard card = SavedCard.builder()
                .adminPaymentSetting(setting)
                .cardholderName(cardholderName)
                .maskedNumber(maskedNumber)
                .hashedPin(passwordEncoder.encode(cardPin))
                .build();

        savedCardRepository.save(card);
    }

    @Transactional
    public void removeSavedCard(User admin, Long cardId) {
        AdminPaymentSetting setting = adminPaymentSettingRepository.findByAdminId(admin.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin payment settings not found"));
        
        SavedCard card = savedCardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));
                
        if (!card.getAdminPaymentSetting().getId().equals(setting.getId())) {
            throw new SecurityException("Unauthorized to remove this card");
        }
        
        savedCardRepository.delete(card);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentSettings(User admin) {
        Optional<AdminPaymentSetting> settingOpt = adminPaymentSettingRepository.findByAdminId(admin.getId());
        boolean hasMpin = settingOpt.isPresent() && settingOpt.get().getHashedMpin() != null;
        List<Map<String, Object>> cards = List.of();
        
        if (settingOpt.isPresent()) {
            cards = settingOpt.get().getSavedCards().stream()
                    .map(c -> Map.of(
                            "id", (Object) c.getId(),
                            "cardholderName", (Object) c.getCardholderName(),
                            "maskedNumber", (Object) c.getMaskedNumber()
                    ))
                    .toList();
        }
        
        return Map.of(
                "hasMpin", hasMpin,
                "savedCards", cards
        );
    }

    @Transactional(readOnly = true)
    public boolean verifyCardPin(User admin, Long cardId, String pin) {
        AdminPaymentSetting setting = adminPaymentSettingRepository.findByAdminId(admin.getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment settings are not configured for this Admin."));
        
        SavedCard card = savedCardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("The selected payment card could not be found."));
                
        if (!card.getAdminPaymentSetting().getId().equals(setting.getId())) {
            throw new IllegalArgumentException("The selected payment card could not be found.");
        }
        
        if (!passwordEncoder.matches(pin, card.getHashedPin())) {
            throw new SecurityException("Invalid payment PIN/MPIN.");
        }
        return true;
    }
}
