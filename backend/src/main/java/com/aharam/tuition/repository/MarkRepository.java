package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudent_StudentIdAndDeletedAtIsNull(String studentId);

    List<Mark> findByExam_IdAndDeletedAtIsNull(Long examId);

    List<Mark> findByExam_NameAndStudent_ExamBatchAndDeletedAtIsNull(String examName, Integer examBatch);
}
