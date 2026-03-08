package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.response.ExamResponseDto;
import com.aharam.tuition.dto.response.MarkEntryResponseDto;
import com.aharam.tuition.entity.Exam;
import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.service.MarkService;
import com.aharam.tuition.util.ErrorMessageUtil;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marks")
public class MarkController {

    @Autowired
    private MarkService markService;

    @PostMapping("/exams/create")
    public ResponseEntity<ApiResponse<ExamResponseDto>> createExam(@RequestBody Exam exam, @RequestParam Long staffId) {
        Exam created = markService.createExam(exam, staffId);
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toExam(created), "Exam created successfully"));
    }

    @GetMapping("/exams/batch/{batch}")
    public ResponseEntity<ApiResponse<List<ExamResponseDto>>> getExamsByBatch(@PathVariable String batch) {
        List<ExamResponseDto> exams = markService.getActiveExamsByBatch(batch).stream()
                .map(ResponseMapper::toExam)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(exams, "Fetched batch exams"));
    }

    @PostMapping("/bulk-save")
    public ResponseEntity<ApiResponse<List<MarkEntryResponseDto>>> bulkSaveMarks(@RequestBody BulkSaveRequest request) {
        try {
            List<Mark> saved = markService.bulkSaveMarks(
                    request.getExamId(),
                    request.getEntries(),
                    request.getStaffId());
            List<MarkEntryResponseDto> dto = saved.stream().map(ResponseMapper::toMarkEntry).toList();
            return ResponseEntity.ok(ApiResponse.success(dto, "Bulk marks saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ErrorMessageUtil.safeMessage(e, "Failed to save marks."),
                            "BULK_SAVE_FAILED"));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<MarkEntryResponseDto>>> getStudentResults(@PathVariable String studentId) {
        List<MarkEntryResponseDto> records = markService.getStudentResults(studentId).stream()
                .map(ResponseMapper::toMarkEntry)
                .peek(dto -> {
                    if (dto.getStudentId() == null || dto.getStudentId().isBlank()) {
                        dto.setStudentId(studentId);
                    }
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student results"));
    }

    @GetMapping("/analytics/{examId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(@PathVariable Long examId) {
        return ResponseEntity
                .ok(ApiResponse.success(markService.getSubjectAnalytics(examId), "Fetched exam analytics"));
    }

    @Data
    public static class BulkSaveRequest {
        private Long examId;
        private Long staffId;
        private List<Map<String, Object>> entries;
    }
}
