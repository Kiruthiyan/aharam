package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.service.FeeService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeeController {

    @Autowired
    private FeeService feeService;

    @PostMapping("/pay")
    public ResponseEntity<?> payFee(@RequestBody PaymentRequest request) {
        try {
            return ResponseEntity.ok(feeService.recordPayment(
                    request.getStudentId(),
                    request.getMonth(),
                    request.getAmount(),
                    request.getRecordedBy()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Fee>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(feeService.getStudentFees(studentId));
    }

    @GetMapping("/batch/{batch}")
    public ResponseEntity<List<Fee>> getBatchFees(@PathVariable Integer batch) {
        return ResponseEntity.ok(feeService.getBatchFees(batch));
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> bulkPayFees(@RequestBody List<PaymentRequest> requests) {
        try {
            requests.forEach(req -> feeService.recordPayment(
                    req.getStudentId(), req.getMonth(), req.getAmount(), req.getRecordedBy()));
            return ResponseEntity.ok("Bulk fees recorded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    static class PaymentRequest {
        private String studentId;
        private String month;
        private Double amount;
        private String recordedBy;
    }
}
