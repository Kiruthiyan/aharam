package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.service.AttendanceService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.aharam.tuition.dto.ApiResponse;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark-manual")
    public ResponseEntity<ApiResponse<Attendance>> markManual(@RequestBody AttendanceRequest request) {
        try {
            Attendance attendance = attendanceService.markAttendance(
                    request.getStudentId(),
                    request.getDate() != null ? request.getDate() : LocalDate.now(),
                    request.getStatus(),
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(attendance, "Attendance marked manually"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "MARK_FAILED"));
        }
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<Attendance>> scanBarcode(@RequestBody ScanRequest request) {
        try {
            Attendance attendance = attendanceService.scanBarcode(
                    request.getBarcode(),
                    request.getStaffId(),
                    request.getBatch(),
                    request.getCenter());
            return ResponseEntity.ok(ApiResponse.success(attendance, "Barcode scanned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "SCAN_FAILED"));
        }
    }

    @PostMapping("/end-session")
    public ResponseEntity<ApiResponse<String>> endSession(@RequestBody SessionEndRequest request) {
        try {
            attendanceService.autoAbsentRemainder(request.getBatch(), request.getDate(), request.getStaffId());
            return ResponseEntity
                    .ok(ApiResponse.success(null, "Session ended. Absent records created for remaining students."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "END_SESSION_FAILED"));
        }
    }

    @GetMapping("/batch/{batch}")
    public ResponseEntity<ApiResponse<List<Attendance>>> getBatchAttendance(
            @PathVariable Integer batch,
            @RequestParam String start,
            @RequestParam String end) {
        List<Attendance> attendances = attendanceService.getBatchAttendance(LocalDate.parse(start),
                LocalDate.parse(end), batch);
        return ResponseEntity.ok(ApiResponse.success(attendances, "Fetched batch attendance"));
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
