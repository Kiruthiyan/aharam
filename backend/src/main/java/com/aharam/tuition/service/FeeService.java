package com.aharam.tuition.service;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.FeeLog;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.FeeLogRepository;
import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FeeService {

    private static final Set<String> VALID_MONTHS = Set.of(
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December");

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

    public Fee scanBarcode(String barcode, String month, String academicYear, Long staffId) {
        Student student = studentRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Student not found for barcode: " + barcode));

        return setFeeStatus(
                student.getStudentId(),
                normalizeMonth(month),
                normalizeAcademicYear(academicYear),
                Fee.FeeStatus.PAID,
                Fee.UpdateMethod.BARCODE,
                staffId);
    }

    public Fee markManual(String studentId, String month, String academicYear, Fee.FeeStatus status, Long staffId) {
        return setFeeStatus(
                studentId,
                normalizeMonth(month),
                normalizeAcademicYear(academicYear),
                status,
                Fee.UpdateMethod.MANUAL,
                staffId);
    }

    private Fee setFeeStatus(String studentId, String month, String academicYear,
            Fee.FeeStatus newStatus, Fee.UpdateMethod method, Long staffId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        if (student.getStatus() != StudentStatus.ACTIVE) {
            throw new IllegalArgumentException("Student is not active.");
        }
        if (student.getUser() != null && !student.getUser().isActive()) {
            throw new IllegalArgumentException("Student account is inactive.");
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found: " + staffId));

        Fee fee = feeRepository
                .findByStudent_StudentIdAndAcademicYearAndMonthAndDeletedAtIsNull(studentId, academicYear, month)
                .orElse(null);

        Fee.FeeStatus oldStatus = fee != null ? fee.getStatus() : Fee.FeeStatus.PENDING;

        if (fee != null && fee.getStatus() == newStatus) {
            throw new IllegalArgumentException(
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

        FeeLog log = new FeeLog();
        log.setFee(fee);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(staff);
        log.setMethod(method);
        feeLogRepository.save(log);

        if (oldStatus != newStatus) {
            String prefix = newStatus == Fee.FeeStatus.PAID ? "Fee Paid" : "Fee Pending";
            notificationService.sendToUser(
                    studentId,
                    prefix + ": " + month + " " + academicYear,
                    student.getFullName() + " fee status for " + month + " is now " + newStatus + ".",
                    "FEES");
        }

        return fee;
    }

    public List<Fee> getBatchFeesByMonthYear(Integer batch, String month, String academicYear) {
        return feeRepository.findByBatchMonthYear(batch, normalizeMonth(month), normalizeAcademicYear(academicYear));
    }

    public List<Fee> getAllBatchFees(Integer batch, String academicYear) {
        return feeRepository.findByStudent_ExamBatchAndAcademicYearAndDeletedAtIsNull(batch,
                normalizeAcademicYear(academicYear));
    }

    public List<Fee> getStudentFees(String studentId) {
        return feeRepository.findHistoryByStudentId(studentId);
    }

    public List<Fee> getAllByYear(String academicYear) {
        return feeRepository.findAllByAcademicYear(normalizeAcademicYear(academicYear));
    }

    public List<FeeLog> getFeeAuditLog(Long feeId) {
        return feeLogRepository.findByFee_IdOrderByChangedAtDesc(feeId);
    }

    public Map<String, Object> getAdminSummary(String academicYear) {
        List<Fee> all = feeRepository.findAllByAcademicYear(normalizeAcademicYear(academicYear));
        long paid = all.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID).count();
        long pending = all.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PENDING).count();
        long total = all.size();
        double pct = total > 0 ? Math.round((paid * 100.0) / total) : 0;

        Map<Integer, Long> batchPending = all.stream()
                .filter(f -> f.getStatus() == Fee.FeeStatus.PENDING && f.getStudent() != null)
                .collect(Collectors.groupingBy(
                        f -> f.getStudent().getExamBatch() != null ? f.getStudent().getExamBatch() : 0,
                        Collectors.counting()));

        Map<String, Long> monthlyPaid = all.stream()
                .filter(f -> f.getStatus() == Fee.FeeStatus.PAID)
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

    private String normalizeMonth(String month) {
        if (month == null || month.isBlank()) {
            throw new IllegalArgumentException("Month is required.");
        }
        String normalized = month.trim();
        normalized = normalized.substring(0, 1).toUpperCase() + normalized.substring(1).toLowerCase();
        if (!VALID_MONTHS.contains(normalized)) {
            throw new IllegalArgumentException("Invalid month: " + month);
        }
        return normalized;
    }

    private String normalizeAcademicYear(String academicYear) {
        if (academicYear == null || academicYear.isBlank()) {
            throw new IllegalArgumentException("Academic year is required.");
        }
        String normalized = academicYear.trim();
        if (!normalized.matches("\\d{4}")) {
            throw new IllegalArgumentException("Academic year must be a 4-digit year.");
        }
        return normalized;
    }
}
