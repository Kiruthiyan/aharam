package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.response.FeeLogDto;
import com.aharam.tuition.dto.response.FeeStatusDto;
import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.service.FeeService;
import com.aharam.tuition.util.ErrorMessageUtil;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<FeeStatusDto>> scanBarcode(@RequestBody BarcodeRequest request) {
        try {
            Fee fee = feeService.scanBarcode(
                    request.getBarcode(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toFeeStatus(fee), "Fee scanned successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ErrorMessageUtil.safeMessage(e, "Failed to scan fee barcode."),
                            "SCAN_FAILED"));
        }
    }

    @PostMapping("/manual")
    public ResponseEntity<ApiResponse<FeeStatusDto>> markManual(@RequestBody ManualRequest request) {
        try {
            Fee.FeeStatus status = Fee.FeeStatus.valueOf(request.getStatus().toUpperCase());
            Fee fee = feeService.markManual(
                    request.getStudentId(),
                    request.getMonth(),
                    request.getAcademicYear(),
                    status,
                    request.getStaffId());
            return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toFeeStatus(fee), "Fee marked manually"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid status: " + request.getStatus(), "INVALID_STATUS"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(ErrorMessageUtil.safeMessage(e, "Failed to update fee status."),
                            "MARK_FAILED"));
        }
    }

    @GetMapping("/batch/{batch}")
    public ResponseEntity<ApiResponse<List<FeeStatusDto>>> getBatchFees(
            @PathVariable Integer batch,
            @RequestParam(required = false) String month,
            @RequestParam String academicYear) {
        List<Fee> data;
        String message;
        if (month != null && !month.isBlank()) {
            data = feeService.getBatchFeesByMonthYear(batch, month, academicYear);
            message = "Fetched batch monthly fees";
        } else {
            data = feeService.getAllBatchFees(batch, academicYear);
            message = "Fetched batch yearly fees";
        }
        List<FeeStatusDto> records = data.stream().map(ResponseMapper::toFeeStatus).toList();
        return ResponseEntity.ok(ApiResponse.success(records, message));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<FeeStatusDto>>> getStudentFees(@PathVariable String studentId) {
        List<FeeStatusDto> records = feeService.getStudentFees(studentId).stream()
                .map(ResponseMapper::toFeeStatus)
                .peek(dto -> {
                    if (dto.getStudentId() == null || dto.getStudentId().isBlank()) {
                        dto.setStudentId(studentId);
                    }
                })
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student fee history"));
    }

    @GetMapping("/{feeId}/logs")
    public ResponseEntity<ApiResponse<List<FeeLogDto>>> getAuditLog(@PathVariable Long feeId) {
        List<FeeLogDto> logs = feeService.getFeeAuditLog(feeId).stream()
                .map(ResponseMapper::toFeeLog)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(logs, "Fetched fee audit logs"));
    }

    @GetMapping("/admin/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminSummary(@RequestParam String academicYear) {
        return ResponseEntity
                .ok(ApiResponse.success(feeService.getAdminSummary(academicYear), "Fetched admin fee summary"));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<FeeStatusDto>>> getAllByYear(@RequestParam String academicYear) {
        List<FeeStatusDto> records = feeService.getAllByYear(academicYear).stream()
                .map(ResponseMapper::toFeeStatus)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched all fees for year"));
    }

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
        private String status;
        private Long staffId;
    }
}
