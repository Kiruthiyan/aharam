package com.aharam.tuition.repository;

import com.aharam.tuition.entity.FeeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeLogRepository extends JpaRepository<FeeLog, Long> {
    List<FeeLog> findByFee_IdOrderByChangedAtDesc(Long feeId);
}
