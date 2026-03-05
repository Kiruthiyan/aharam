package com.aharam.tuition.controller;

import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeeRepository feeRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.findAll().stream()
                .filter(s -> s.getStatus() != null && s.getStatus().name().equals("ACTIVE"))
                .count();

        long totalPaid = feeRepository.findAll().stream()
                .filter(f -> f.getStatus() != null && f.getStatus().name().equals("PAID"))
                .count();
        long totalPending = feeRepository.findAll().stream()
                .filter(f -> f.getStatus() == null || f.getStatus().name().equals("PENDING"))
                .count();

        return ResponseEntity.ok(new ReportSummary(totalStudents, activeStudents, totalPaid, totalPending));
    }

    @GetMapping("/defaulters")
    public ResponseEntity<List<DefaulterDTO>> getDefaulters() {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    static class ReportSummary {
        private long totalStudents;
        private long activeStudents;
        private long feesPaid;
        private long feesPending;
    }

    @lombok.Data
    static class DefaulterDTO {
        private String studentId;
        private String name;
    }
}
