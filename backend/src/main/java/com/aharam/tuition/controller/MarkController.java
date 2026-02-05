package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.service.MarkService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MarkController {

    @Autowired
    private MarkService markService;

    @PostMapping("/add")
    public ResponseEntity<?> addMark(@RequestBody MarkRequest request) {
        try {
            return ResponseEntity.ok(markService.addMark(
                    request.getStudentId(),
                    request.getExamName(),
                    request.getSubject(),
                    request.getScore(),
                    request.getMaxScore()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Mark>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(markService.getStudentMarks(studentId));
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkAddMarks(@RequestBody List<MarkRequest> requests) {
        try {
            return ResponseEntity.ok(markService.bulkAddMarks(requests));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/batch/{examName}/{batch}")
    public ResponseEntity<List<Mark>> getBatchMarks(@PathVariable String examName, @PathVariable Integer batch) {
        return ResponseEntity.ok(markService.getMarksByBatch(examName, batch));
    }

    @Data
    public static class MarkRequest {
        private String studentId;
        private String examName;
        private String subject;
        private Double score;
        private Double maxScore;
    }
}
