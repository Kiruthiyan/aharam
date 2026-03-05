package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.Mark;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.service.AttendanceService;
import com.aharam.tuition.service.FeeService;
import com.aharam.tuition.service.MarkService;
import com.aharam.tuition.dto.MessageResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class StudentDashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private FeeService feeService;

    @Autowired
    private MarkService markService;

    private Student getAuthenticatedStudent() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: Student profile not found for email: " + email));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            return ResponseEntity.ok(getAuthenticatedStudent());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance() {
        try {
            Student student = getAuthenticatedStudent();
            List<Attendance> records = attendanceService.getStudentAttendance(student.getStudentId());
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/fees")
    public ResponseEntity<?> getFees() {
        try {
            Student student = getAuthenticatedStudent();
            List<Fee> records = feeService.getStudentFees(student.getStudentId());
            // Map the fees DTO if you need to hide amounts (depending on requirement)
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/marks")
    public ResponseEntity<?> getMarks() {
        try {
            Student student = getAuthenticatedStudent();
            List<Mark> records = markService.getStudentResults(student.getStudentId());
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
