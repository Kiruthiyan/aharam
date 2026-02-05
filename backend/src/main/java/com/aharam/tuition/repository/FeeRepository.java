package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudent_StudentId(String studentId);

    List<Fee> findByStatus(Fee.PaymentStatus status);

    List<Fee> findByStudent_ExamBatch(Integer examBatch);
}
