package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByBatchAndStatusNot(String batch, Exam.ExamStatus status);
    List<Exam> findBySubjectAndBatchAndStatusNot(String subject, String batch, Exam.ExamStatus status);
}
