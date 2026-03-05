package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Fee;
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

    @Query("SELECT f FROM Fee f WHERE f.academicYear = :year AND f.deletedAt IS NULL")
    List<Fee> findAllByAcademicYear(@Param("year") String year);

    @Query("SELECT f FROM Fee f " +
            "JOIN f.student s " +
            "WHERE s.examBatch = :batch AND f.academicYear = :year AND f.month = :month AND f.deletedAt IS NULL")
    List<Fee> findByBatchMonthYear(@Param("batch") Integer batch, @Param("month") String month,
            @Param("year") String year);
}
