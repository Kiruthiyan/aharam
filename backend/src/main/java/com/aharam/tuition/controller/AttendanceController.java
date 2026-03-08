package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.service.AttendanceService;
import com.aharam.tuition.dto.response.AttendanceSummaryDto;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.util.ErrorMessageUtil;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import com.aharam.tuition.dto.ApiResponse;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark-manual")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> markManual(@RequestBody AttendanceRequest request) {
        try {
            Attendance attendance = attendanceService.markAttendance(
                    request.getStudentId(),
                    request.getDate() != null ? request.getDate() : LocalDate.now(),
                    request.getStatus(),
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toAttendance(attendance),
                    "Attendance marked manually"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(ErrorMessageUtil.safeMessage(e, "Failed to mark attendance."), "MARK_FAILED"));
        }
    }

    @PostMapping("/mark")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> mark(@RequestBody AttendanceRequest request) {
        // Alias for /mark-manual to support mobile app expectations
        return markManual(request);
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<AttendanceSummaryDto>> scanBarcode(@RequestBody ScanRequest request) {
        try {
            Attendance attendance = attendanceService.scanBarcode(
                    request.getBarcode(),
                    request.getStaffId(),
                    request.getBatch(),
                    request.getCenter());
            return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toAttendance(attendance),
                    "Barcode scanned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(ErrorMessageUtil.safeMessage(e, "Failed to scan barcode."), "SCAN_FAILED"));
        }
    }

    @PostMapping("/end-session")
    public ResponseEntity<ApiResponse<String>> endSession(@RequestBody SessionEndRequest request) {
        try {
            attendanceService.autoAbsentRemainder(request.getBatch(), request.getDate(), request.getStaffId());
            return ResponseEntity
                    .ok(ApiResponse.success(null, "Session ended. Absent records created for remaining students."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    ErrorMessageUtil.safeMessage(e, "Failed to end attendance session."), "END_SESSION_FAILED"));
        }
    }

    @GetMapping("/batch/{batch}")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDto>>> getBatchAttendance(
            @PathVariable Integer batch,
            @RequestParam String start,
            @RequestParam String end) {
        List<Attendance> attendances = attendanceService.getBatchAttendance(LocalDate.parse(start),
                LocalDate.parse(end), batch);
        List<AttendanceSummaryDto> dto = attendances.stream().map(ResponseMapper::toAttendance).toList();
        return ResponseEntity.ok(ApiResponse.success(dto, "Fetched batch attendance"));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDto>>> getStudentAttendance(@PathVariable String studentId) {
        List<AttendanceSummaryDto> records = attendanceService.getStudentAttendance(studentId).stream()
                .map(ResponseMapper::toAttendance)
                .peek(dto -> {
                    if (dto.getStudentId() == null || dto.getStudentId().isBlank()) {
                        dto.setStudentId(studentId);
                    }
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student attendance"));
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
