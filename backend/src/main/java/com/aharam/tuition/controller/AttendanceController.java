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

    @PostMapping("/mark")
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceRequest request) {
        try {
            return ResponseEntity.ok(attendanceService.markAttendance(
                    request.getStudentId(),
                    request.getDate(),
                    request.getStatus(),
                    request.getRecordedBy()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<Attendance>> getByDate(@PathVariable String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(LocalDate.parse(date)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkMarkAttendance(@RequestBody List<AttendanceRequest> requests) {
        try {
            requests.forEach(req -> attendanceService.markAttendance(
                    req.getStudentId(), req.getDate(), req.getStatus(), req.getRecordedBy()));
            return ResponseEntity.ok("Bulk attendance marked successfully");
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
        private String recordedBy;
    }
}
