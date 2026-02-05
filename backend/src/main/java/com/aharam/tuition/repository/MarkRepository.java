package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudent_StudentId(String studentId);

    List<Mark> findByExamNameAndSubject(String examName, String subject);

    List<Mark> findByExamNameAndStudent_ExamBatch(String examName, Integer examBatch);
}
