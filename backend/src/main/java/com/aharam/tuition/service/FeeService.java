package com.aharam.tuition.service;

import com.aharam.tuition.entity.*;
import com.aharam.tuition.entity.Fee.FeeStatus;
import com.aharam.tuition.entity.Fee.UpdateMethod;
import com.aharam.tuition.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private FeeLogRepository feeLogRepository;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private UserRepository userRepository;

    // ── Barcode scan ─────────────────────────────────────────────────────────

    /**
     * Scans a student barcode and marks their fee for the given month/year as PAID.
     */
    public Fee scanBarcode(String barcode, String month, String academicYear, Long staffId) {
        // barcode field on Student is the physical barcode on the card
        Student student = studentRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Student not found for barcode: " + barcode));

        return setFeeStatus(student.getStudentId(), month, academicYear, FeeStatus.PAID, UpdateMethod.BARCODE, staffId);
    }

    // ── Manual update ─────────────────────────────────────────────────────────

    public Fee markManual(String studentId, String month, String academicYear, FeeStatus status, Long staffId) {
        return setFeeStatus(studentId, month, academicYear, status, UpdateMethod.MANUAL, staffId);
    }

    // ── Common set logic ──────────────────────────────────────────────────────

    private Fee setFeeStatus(String studentId, String month, String academicYear,
            FeeStatus newStatus, UpdateMethod method, Long staffId) {
        // studentId is the JPA primary key of Student entity
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found: " + staffId));

        Fee fee = feeRepository
                .findByStudent_StudentIdAndAcademicYearAndMonthAndDeletedAtIsNull(studentId, academicYear, month)
                .orElse(null);

        FeeStatus oldStatus = fee != null ? fee.getStatus() : FeeStatus.PENDING;

        // Guard: if already at requested status
        if (fee != null && fee.getStatus() == newStatus) {
            throw new RuntimeException(
                    "Fee already marked as " + newStatus + " for " + month + " " + academicYear + ".");
        }

        if (fee == null) {
            fee = new Fee();
            fee.setStudent(student);
            fee.setAcademicYear(academicYear);
            fee.setMonth(month);
        }

        fee.setStatus(newStatus);
        fee.setUpdateMethod(method);
        fee.setUpdatedBy(staff);
        feeRepository.save(fee);

        // Create audit log
        FeeLog log = new FeeLog();
        log.setFee(fee);
        log.setOldStatus(oldStatus);
        log.setMethod(method);
        feeLogRepository.save(log);

        // Send Notification if status actually changed
        if (oldStatus != newStatus) {
            String emoji = newStatus == FeeStatus.PAID ? "✅" : "⏳";
            notificationService.sendToUser(
                    studentId,
                    emoji + " Fee Update: " + month + " " + academicYear,
                    student.getFullName() + "'s fee for " + month + " is now " + newStatus + ".",
                    "FEES");
        }

        return fee;
    }

    // ── Queries ───────────────────────────────────────────────────────────────

    public List<Fee> getBatchFeesByMonthYear(Integer batch, String month, String academicYear) {
        return feeRepository.findByBatchMonthYear(batch, month, academicYear);
    }

    public List<Fee> getAllBatchFees(Integer batch, String academicYear) {
        return feeRepository.findByStudent_ExamBatchAndAcademicYearAndDeletedAtIsNull(batch, academicYear);
    }

    public List<Fee> getStudentFees(String studentId) {
        return feeRepository.findByStudent_StudentIdAndDeletedAtIsNull(studentId);
    }

    public List<Fee> getAllByYear(String academicYear) {
        return feeRepository.findAllByAcademicYear(academicYear);
    }

    public List<FeeLog> getFeeAuditLog(Long feeId) {
        return feeLogRepository.findByFee_IdOrderByChangedAtDesc(feeId);
    }

    // ── Admin summary ─────────────────────────────────────────────────────────

    public Map<String, Object> getAdminSummary(String academicYear) {
        List<Fee> all = feeRepository.findAllByAcademicYear(academicYear);
        long paid = all.stream().filter(f -> f.getStatus() == FeeStatus.PAID).count();
        long pending = all.stream().filter(f -> f.getStatus() == FeeStatus.PENDING).count();
        long total = all.size();
        double pct = total > 0 ? Math.round((paid * 100.0) / total) : 0;

        // Batch-wise breakdown
        Map<Integer, Long> batchPending = all.stream()
                .filter(f -> f.getStatus() == FeeStatus.PENDING && f.getStudent() != null)
                .collect(Collectors.groupingBy(
                        f -> f.getStudent().getExamBatch() != null ? f.getStudent().getExamBatch() : 0,
                        Collectors.counting()));

        // Month-wise paid counts
        Map<String, Long> monthlyPaid = all.stream()
                .filter(f -> f.getStatus() == FeeStatus.PAID)
                .collect(Collectors.groupingBy(Fee::getMonth, Collectors.counting()));

        Map<String, Object> resp = new HashMap<>();
        resp.put("totalRecords", total);
        resp.put("paid", paid);
        resp.put("pending", pending);
        resp.put("completionPercentage", pct);
        resp.put("batchPending", batchPending);
        resp.put("monthlyPaid", monthlyPaid);
        return resp;
    }
}
