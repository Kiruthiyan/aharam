package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByStudent_StudentId(String studentId);

    Optional<Attendance> findByStudent_StudentIdAndDate(String studentId, LocalDate date);

    List<Attendance> findByDateBetweenAndStudent_ExamBatch(LocalDate startDate, LocalDate endDate, Integer examBatch);

    @Query(value = """
            SELECT *
            FROM attendance a
            WHERE a.student_id = :studentId
              AND a.deleted_at IS NULL
            ORDER BY a.date DESC, a.created_at DESC
            """, nativeQuery = true)
    List<Attendance> findHistoryByStudentId(@Param("studentId") String studentId);

    @Query(value = """
            SELECT *
            FROM attendance a
            WHERE a.student_id = :studentId
              AND a.date = :date
              AND a.deleted_at IS NULL
            LIMIT 1
            """, nativeQuery = true)
    Optional<Attendance> findByStudentIdAndDate(@Param("studentId") String studentId, @Param("date") LocalDate date);

    @Query("""
            SELECT COUNT(a)
            FROM Attendance a
            WHERE a.date = :date
              AND a.status IN :statuses
            """)
    long countByDateAndStatusIn(@Param("date") LocalDate date, @Param("statuses") Collection<Attendance.AttendanceStatus> statuses);

    @Query("""
            SELECT COUNT(a)
            FROM Attendance a
            WHERE a.date = :date
              AND a.status = :status
            """)
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") Attendance.AttendanceStatus status);

    @Query("""
            SELECT COUNT(DISTINCT a.student.studentId)
            FROM Attendance a
            WHERE a.date = :date
              AND a.markedBy.id = :staffId
              AND a.student.studentId IS NOT NULL
            """)
    long countDistinctStudentsMarkedByStaffOnDate(@Param("date") LocalDate date, @Param("staffId") Long staffId);
}
