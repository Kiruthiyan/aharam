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
import com.aharam.tuition.dto.ApiResponse;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MarkController {

    @Autowired
    private MarkService markService;

    // --- Exam Endpoints ---

    @PostMapping("/exams/create")
    public ResponseEntity<ApiResponse<Exam>> createExam(@RequestBody Exam exam, @RequestParam Long staffId) {
        return ResponseEntity
                .ok(ApiResponse.success(markService.createExam(exam, staffId), "Exam created successfully"));
    }

    @GetMapping("/exams/batch/{batch}")
    public ResponseEntity<ApiResponse<List<Exam>>> getExamsByBatch(@PathVariable String batch) {
        return ResponseEntity.ok(ApiResponse.success(markService.getActiveExamsByBatch(batch), "Fetched batch exams"));
    }

    // --- Marks Endpoints ---

    @PostMapping("/bulk-save")
    public ResponseEntity<ApiResponse<List<Mark>>> bulkSaveMarks(@RequestBody BulkSaveRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success(markService.bulkSaveMarks(
                    request.getExamId(),
                    request.getEntries(),
                    request.getStaffId()), "Bulk marks saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "BULK_SAVE_FAILED"));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Mark>>> getStudentResults(@PathVariable String studentId) {
        return ResponseEntity
                .ok(ApiResponse.success(markService.getStudentResults(studentId), "Fetched student results"));
    }

    @GetMapping("/analytics/{examId}")
    public ResponseEntity<ApiResponse<?>> getAnalytics(@PathVariable Long examId) {
        return ResponseEntity
                .ok(ApiResponse.success(markService.getSubjectAnalytics(examId), "Fetched exam analytics"));
    }

    @Data
    public static class BulkSaveRequest {
        private Long examId;
        private Long staffId;
        private List<Map<String, Object>> entries; // [{ "studentId": "...", "score": 85, "remarks": "..." }]
    }
}
