package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Exam;
import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.service.MarkService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MarkController {

    @Autowired
    private MarkService markService;

    // --- Exam Endpoints ---

    @PostMapping("/exams/create")
    public ResponseEntity<?> createExam(@RequestBody Exam exam, @RequestParam Long staffId) {
        return ResponseEntity.ok(markService.createExam(exam, staffId));
    }

    @GetMapping("/exams/batch/{batch}")
    public ResponseEntity<List<Exam>> getExamsByBatch(@PathVariable String batch) {
        return ResponseEntity.ok(markService.getActiveExamsByBatch(batch));
    }

    // --- Marks Endpoints ---

    @PostMapping("/bulk-save")
    public ResponseEntity<?> bulkSaveMarks(@RequestBody BulkSaveRequest request) {
        try {
            return ResponseEntity.ok(markService.bulkSaveMarks(
                    request.getExamId(),
                    request.getEntries(),
                    request.getStaffId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Mark>> getStudentResults(@PathVariable String studentId) {
        return ResponseEntity.ok(markService.getStudentResults(studentId));
    }

    @GetMapping("/analytics/{examId}")
    public ResponseEntity<?> getAnalytics(@PathVariable Long examId) {
        return ResponseEntity.ok(markService.getSubjectAnalytics(examId));
    }

    @Data
    public static class BulkSaveRequest {
        private Long examId;
        private Long staffId;
        private List<Map<String, Object>> entries; // [{ "studentId": "...", "score": 85, "remarks": "..." }]
    }
}
