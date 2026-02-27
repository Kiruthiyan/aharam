package com.aharam.tuition.service;

import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private NotificationService notificationService;

    public Fee recordPayment(String studentId, String month, Double amount, String recordedBy) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Fee fee = new Fee();
        fee.setStudent(student);
        fee.setMonth(month);
        fee.setAmount(amount);
        fee.setStatus(Fee.PaymentStatus.PAID);
        fee.setPaidDate(LocalDate.now());
        fee.setRecordedBy(recordedBy);

        Fee saved = feeRepository.save(fee);

        // 🔔 Push notification to parent
        notificationService.sendToUser(
                studentId,
                "💰 Fee Payment Recorded",
                "Rs." + amount.intValue() + " fee for " + month + " has been recorded. Thank you!");

        return saved;
    }

    public List<Fee> getStudentFees(String studentId) {
        return feeRepository.findByStudent_StudentId(studentId);
    }

    public List<Fee> getBatchFees(Integer examBatch) {
        return feeRepository.findByStudent_ExamBatch(examBatch);
    }

    public void bulkRecordPayment(List<Fee> fees) {
        feeRepository.saveAll(fees);
    }
}
