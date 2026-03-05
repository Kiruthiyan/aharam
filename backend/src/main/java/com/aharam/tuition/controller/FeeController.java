package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.service.FeeService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.aharam.tuition.dto.ApiResponse;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeeController {

    @Autowired
    private FeeService feeService;

    // ── Staff Endpoints ────────────────────────────────────────────────────────

    /** Barcode scan — marks fee PAID for given month/year */
    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<Fee>> scanBarcode(@RequestBody BarcodeRequest request) {
        try {
            Fee fee = feeService.scanBarcode(
                    request.getBarcode(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(fee, "Fee scanned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "SCAN_FAILED"));
        }
    }

    /** Manual mark — update any student fee status */
    @PostMapping("/manual")
    public ResponseEntity<ApiResponse<Fee>> markManual(@RequestBody ManualRequest request) {
        try {
            Fee.FeeStatus status = Fee.FeeStatus.valueOf(request.getStatus().toUpperCase());
            Fee fee = feeService.markManual(
                    request.getStudentId(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    status,
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(fee, "Fee marked manually"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status: " + request.getStatus(), "INVALID_STATUS"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "MARK_FAILED"));
        }
    }

    /** Batch monitoring — get all fees for a batch/month/year */
    @GetMapping("/batch/{batch}")
    public ResponseEntity<ApiResponse<List<Fee>>> getBatchFees(
            @PathVariable Integer batch,
            @RequestParam(required = false) String month,
            @RequestParam String academicYear) {
        if (month != null && !month.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(feeService.getBatchFeesByMonthYear(batch, month, academicYear),
                    "Fetched batch monthly fees"));
        }
        return ResponseEntity
                .ok(ApiResponse.success(feeService.getAllBatchFees(batch, academicYear), "Fetched batch yearly fees"));
    }

    /** Student self-view */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Fee>>> getStudentFees(@PathVariable String studentId) {
        return ResponseEntity
                .ok(ApiResponse.success(feeService.getStudentFees(studentId), "Fetched student fee history"));
    }

    /** Audit log for a specific fee record */
    @GetMapping("/{feeId}/logs")
    public ResponseEntity<ApiResponse<?>> getAuditLog(@PathVariable Long feeId) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getFeeAuditLog(feeId), "Fetched fee audit logs"));
    }

    // ── Admin Endpoints ────────────────────────────────────────────────────────

    /** Admin analytics summary */
    @GetMapping("/admin/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminSummary(@RequestParam String academicYear) {
        return ResponseEntity
                .ok(ApiResponse.success(feeService.getAdminSummary(academicYear), "Fetched admin fee summary"));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<Fee>>> getAllByYear(@RequestParam String academicYear) {
        return ResponseEntity
                .ok(ApiResponse.success(feeService.getAllByYear(academicYear), "Fetched all fees for year"));
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    @Data
    static class BarcodeRequest {
        private String barcode;
        private String month;
        private String academicYear;
        private Long staffId;
    }

    @Data
    static class ManualRequest {
        private String studentId;
        private String month;
        private String academicYear;
        private String status; // "PAID" or "PENDING"
        private Long staffId;
    }
}
