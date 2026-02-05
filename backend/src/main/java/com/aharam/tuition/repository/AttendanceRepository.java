package com.aharam.tuition.repository;

import com.aharam.tuition.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByStudent_StudentId(String studentId);

    Optional<Attendance> findByStudent_StudentIdAndDate(String studentId, LocalDate date);

    List<Attendance> findByDateBetweenAndStudent_ExamBatch(LocalDate startDate, LocalDate endDate, Integer examBatch);
}
