package com.infosys.procurement_system.repository;

import com.infosys.procurement_system.entity.SavedCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedCardRepository extends JpaRepository<SavedCard, Long> {
}
