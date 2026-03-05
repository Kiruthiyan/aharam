package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.service.FeeService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeeController {

    @Autowired
    private FeeService feeService;

    // ── Staff Endpoints ────────────────────────────────────────────────────────

    /** Barcode scan — marks fee PAID for given month/year */
    @PostMapping("/scan")
    public ResponseEntity<?> scanBarcode(@RequestBody BarcodeRequest request) {
        try {
            return ResponseEntity.ok(feeService.scanBarcode(
                    request.getBarcode(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    request.getStaffId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Manual mark — update any student fee status */
    @PostMapping("/manual")
    public ResponseEntity<?> markManual(@RequestBody ManualRequest request) {
        try {
            Fee.FeeStatus status = Fee.FeeStatus.valueOf(request.getStatus().toUpperCase());
            return ResponseEntity.ok(feeService.markManual(
                    request.getStudentId(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    status,
                    request.getStaffId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + request.getStatus());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Batch monitoring — get all fees for a batch/month/year */
    @GetMapping("/batch/{batch}")
    public ResponseEntity<List<Fee>> getBatchFees(
            @PathVariable Integer batch,
            @RequestParam(required = false) String month,
            @RequestParam String academicYear) {
        if (month != null && !month.isBlank()) {
            return ResponseEntity.ok(feeService.getBatchFeesByMonthYear(batch, month, academicYear));
        }
        return ResponseEntity.ok(feeService.getAllBatchFees(batch, academicYear));
    }

    /** Student self-view */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Fee>> getStudentFees(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getStudentFees(studentId));
    }

    /** Audit log for a specific fee record */
    @GetMapping("/{feeId}/logs")
    public ResponseEntity<?> getAuditLog(@PathVariable Long feeId) {
        return ResponseEntity.ok(feeService.getFeeAuditLog(feeId));
    }

    // ── Admin Endpoints ────────────────────────────────────────────────────────

    /** Admin analytics summary */
    @GetMapping("/admin/summary")
    public ResponseEntity<Map<String, Object>> getAdminSummary(@RequestParam String academicYear) {
        return ResponseEntity.ok(feeService.getAdminSummary(academicYear));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Fee>> getAllByYear(@RequestParam String academicYear) {
        return ResponseEntity.ok(feeService.getAllByYear(academicYear));
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
