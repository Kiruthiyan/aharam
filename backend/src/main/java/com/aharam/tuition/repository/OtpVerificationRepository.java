package com.aharam.tuition.repository;

import com.aharam.tuition.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByEmailOrderByCreatedAtDesc(String email);
    
    @Transactional
    void deleteByEmail(String email);
}
