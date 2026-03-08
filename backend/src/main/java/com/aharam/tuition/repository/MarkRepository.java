package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.repository.projection.TopPerformerProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByStudent_StudentIdAndDeletedAtIsNull(String studentId);

    List<Mark> findByExam_IdAndDeletedAtIsNull(Long examId);

    List<Mark> findByExam_NameAndStudent_ExamBatchAndDeletedAtIsNull(String examName, Integer examBatch);

    Optional<Mark> findByExam_IdAndStudent_StudentIdAndDeletedAtIsNull(Long examId, String studentId);

    @Query(value = """
            SELECT *
            FROM academic_results m
            WHERE m.student_id = :studentId
              AND m.deleted_at IS NULL
            ORDER BY m.updated_at DESC NULLS LAST, m.created_at DESC
            """, nativeQuery = true)
    List<Mark> findHistoryByStudentId(@Param("studentId") String studentId);

    @Query(value = """
            SELECT
                s.student_id AS studentId,
                s.full_name AS name,
                s.center AS center,
                s.exam_batch AS examBatch,
                AVG(m.marks_obtained) AS averageScore,
                COUNT(*) AS examsCount
            FROM academic_results m
            JOIN students s ON s.student_id = m.student_id
            WHERE m.deleted_at IS NULL
              AND s.deleted_at IS NULL
            GROUP BY s.student_id, s.full_name, s.center, s.exam_batch
            ORDER BY AVG(m.marks_obtained) DESC, s.full_name ASC
            LIMIT :limitValue
            """, nativeQuery = true)
    List<TopPerformerProjection> findTopPerformers(@Param("limitValue") int limitValue);
}
