package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.service.AttendanceService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark-manual")
    public ResponseEntity<?> markManual(@RequestBody AttendanceRequest request) {
        try {
            return ResponseEntity.ok(attendanceService.markAttendance(
                    request.getStudentId(),
                    request.getDate() != null ? request.getDate() : LocalDate.now(),
                    request.getStatus(),
                    request.getStaffId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/scan")
    public ResponseEntity<?> scanBarcode(@RequestBody ScanRequest request) {
        try {
            return ResponseEntity.ok(attendanceService.scanBarcode(
                    request.getBarcode(),
                    request.getStaffId(),
                    request.getBatch(),
                    request.getCenter()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/end-session")
    public ResponseEntity<?> endSession(@RequestBody SessionEndRequest request) {
        try {
            attendanceService.autoAbsentRemainder(request.getBatch(), request.getDate(), request.getStaffId());
            return ResponseEntity.ok("Session ended. Absent records created for remaining students.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/batch/{batch}")
    public ResponseEntity<List<Attendance>> getBatchAttendance(
            @PathVariable Integer batch,
            @RequestParam String start,
            @RequestParam String end) {
        return ResponseEntity
                .ok(attendanceService.getBatchAttendance(LocalDate.parse(start), LocalDate.parse(end), batch));
    }

    @Data
    static class AttendanceRequest {
        private String studentId;
        private LocalDate date;
        private Attendance.AttendanceStatus status;
        private Long staffId;
    }

    @Data
    static class ScanRequest {
        private String barcode;
        private Long staffId;
        private String batch;
        private String center;
    }

    @Data
    static class SessionEndRequest {
        private String batch;
        private LocalDate date;
        private Long staffId;
    }
}
