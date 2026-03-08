package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.repository.projection.DefaulterProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudent_ExamBatchAndAcademicYearAndDeletedAtIsNull(Integer batch, String year);

    List<Fee> findByStudent_StudentIdAndDeletedAtIsNull(String studentId);

    Optional<Fee> findByStudent_StudentIdAndAcademicYearAndMonthAndDeletedAtIsNull(
            String studentId, String academicYear, String month);

    @Query(value = """
            SELECT *
            FROM fees f
            WHERE f.student_id = :studentId
              AND f.deleted_at IS NULL
            ORDER BY f.updated_at DESC NULLS LAST, f.created_at DESC
            """, nativeQuery = true)
    List<Fee> findHistoryByStudentId(@Param("studentId") String studentId);

    @Query("SELECT f FROM Fee f WHERE f.academicYear = :year AND f.deletedAt IS NULL")
    List<Fee> findAllByAcademicYear(@Param("year") String year);

    @Query("SELECT f FROM Fee f " +
            "JOIN f.student s " +
            "WHERE s.examBatch = :batch AND f.academicYear = :year AND f.month = :month AND f.deletedAt IS NULL")
    List<Fee> findByBatchMonthYear(@Param("batch") Integer batch, @Param("month") String month,
            @Param("year") String year);

    long countByAcademicYearAndStatusAndDeletedAtIsNull(String academicYear, Fee.FeeStatus status);

    long countByStatusAndDeletedAtIsNull(Fee.FeeStatus status);

    @Query("""
            SELECT COUNT(f)
            FROM Fee f
            WHERE f.academicYear = :academicYear
              AND f.status = :status
              AND f.student.studentId IN :studentIds
              AND f.deletedAt IS NULL
            """)
    long countByAcademicYearAndStatusAndStudentIds(
            @Param("academicYear") String academicYear,
            @Param("status") Fee.FeeStatus status,
            @Param("studentIds") List<String> studentIds);

    @Query("""
            SELECT COUNT(f)
            FROM Fee f
            WHERE f.status = :status
              AND f.student.studentId IN :studentIds
              AND f.deletedAt IS NULL
            """)
    long countByStatusAndStudentIds(
            @Param("status") Fee.FeeStatus status,
            @Param("studentIds") List<String> studentIds);

    @Query(value = """
            SELECT
                s.student_id AS studentId,
                s.full_name AS name,
                s.center AS center,
                s.exam_batch AS examBatch,
                COUNT(*) AS pendingCount,
                COALESCE((
                    SELECT f2.month || ' ' || f2.academic_year
                    FROM fees f2
                    WHERE f2.student_id = s.student_id
                      AND f2.deleted_at IS NULL
                      AND (f2.status = 'PENDING' OR f2.status IS NULL)
                    ORDER BY COALESCE(f2.updated_at, f2.created_at) DESC
                    LIMIT 1
                ), '-') AS latestPendingMonth
            FROM fees f
            JOIN students s ON s.student_id = f.student_id
            WHERE f.deleted_at IS NULL
              AND s.deleted_at IS NULL
              AND (f.status = 'PENDING' OR f.status IS NULL)
            GROUP BY s.student_id, s.full_name, s.center, s.exam_batch
            ORDER BY COUNT(*) DESC, s.full_name ASC
            LIMIT :limitValue
            """, nativeQuery = true)
    List<DefaulterProjection> findTopDefaulters(@Param("limitValue") int limitValue);
}
