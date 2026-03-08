package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.repository.AttendanceRepository;
import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.MarkRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.projection.DefaulterProjection;
import com.aharam.tuition.repository.projection.TopPerformerProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MarkRepository markRepository;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReportSummary>> getSummary() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countByStatus(StudentStatus.ACTIVE);
        long inactiveStudents = totalStudents - activeStudents;

        long totalPaid = feeRepository.countByStatusAndDeletedAtIsNull(Fee.FeeStatus.PAID);
        long totalPending = feeRepository.countByStatusAndDeletedAtIsNull(Fee.FeeStatus.PENDING);
        long totalFeeRecords = totalPaid + totalPending;
        double completionRate = totalFeeRecords == 0
                ? 0.0
                : Math.round((totalPaid * 10000.0) / totalFeeRecords) / 100.0;

        long todayPresent = attendanceRepository.countByDateAndStatusIn(
                LocalDate.now(),
                List.of(Attendance.AttendanceStatus.PRESENT, Attendance.AttendanceStatus.LATE));
        long todayAbsent = attendanceRepository.countByDateAndStatus(LocalDate.now(), Attendance.AttendanceStatus.ABSENT);

        return ResponseEntity.ok(ApiResponse.success(new ReportSummary(
                totalStudents,
                activeStudents,
                inactiveStudents,
                totalPaid,
                totalPending,
                completionRate,
                todayPresent,
                todayAbsent), "Fetched report summary"));
    }

    @GetMapping("/defaulters")
    public ResponseEntity<ApiResponse<List<DefaulterDTO>>> getDefaulters() {
        List<DefaulterProjection> raw = feeRepository.findTopDefaulters(10);
        List<DefaulterDTO> defaulters = new ArrayList<>();
        for (DefaulterProjection row : raw) {
            defaulters.add(new DefaulterDTO(
                    row.getStudentId(),
                    row.getName(),
                    row.getCenter(),
                    row.getExamBatch(),
                    row.getPendingCount() == null ? 0 : row.getPendingCount().intValue(),
                    row.getLatestPendingMonth()));
        }

        return ResponseEntity.ok(
                ApiResponse.success(defaulters, "Fetched fee defaulters"));
    }

    @GetMapping("/top-performers")
    public ResponseEntity<ApiResponse<List<TopPerformerDTO>>> getTopPerformers() {
        List<TopPerformerProjection> raw = markRepository.findTopPerformers(10);
        List<TopPerformerDTO> performers = new ArrayList<>();
        for (TopPerformerProjection row : raw) {
            double avg = row.getAverageScore() == null ? 0.0 : row.getAverageScore();
            performers.add(new TopPerformerDTO(
                    row.getStudentId(),
                    row.getName(),
                    row.getCenter(),
                    row.getExamBatch(),
                    Math.round(avg * 100.0) / 100.0,
                    row.getExamsCount() == null ? 0 : row.getExamsCount().intValue()));
        }

        return ResponseEntity.ok(
                ApiResponse.success(performers,
                        "Fetched top performers"));
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class ReportSummary {
        private long totalStudents;
        private long activeStudents;
        private long inactiveStudents;
        private long feePaidRecords;
        private long feePendingRecords;
        private double feeCompletionRate;
        private long attendanceTodayPresent;
        private long attendanceTodayAbsent;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class DefaulterDTO {
        private String studentId;
        private String name;
        private String center;
        private Integer examBatch;
        private int pendingCount;
        private String latestPendingMonth;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class TopPerformerDTO {
        private String studentId;
        private String name;
        private String center;
        private Integer examBatch;
        private double averageScore;
        private int examsCount;
    }
}
