package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.AttendanceRepository;
import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.MarkRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.service.AttendanceService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.findAll().stream().filter(s -> s.getStatus().name().equals("ACTIVE"))
                .count();

        // Mocking Income for now (or summing actual fees)
        double totalIncome = feeRepository.findAll().stream().mapToDouble(f -> f.getAmount()).sum();

        return ResponseEntity.ok(new ReportSummary(totalStudents, activeStudents, totalIncome));
    }

    @GetMapping("/defaulters")
    public ResponseEntity<List<DefaulterDTO>> getDefaulters() {
        // Logic: Find students who haven't paid fees for current month (Mock logic for
        // simplicity)
        // In real world: check against generated fee demands.
        // Here: Return dummy list or those with PENDING status if we had that.

        List<DefaulterDTO> list = new ArrayList<>();
        // Example: just returning empty for now or implementing basic logic
        return ResponseEntity.ok(list);
    }

    @Data
    static class ReportSummary {
        private long totalStudents;
        private long activeStudents;
        private double totalIncome;

        public ReportSummary(long totalStudents, long activeStudents, double totalIncome) {
            this.totalStudents = totalStudents;
            this.activeStudents = activeStudents;
            this.totalIncome = totalIncome;
        }
    }

    @Data
    static class DefaulterDTO {
        private String studentId;
        private String name;
        private double amountDue;
    }
}
