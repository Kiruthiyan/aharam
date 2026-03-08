package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.response.AttendanceSummaryDto;
import com.aharam.tuition.dto.response.FeeStatusDto;
import com.aharam.tuition.dto.response.MarkEntryResponseDto;
import com.aharam.tuition.dto.response.StudentDetailDto;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.service.AttendanceService;
import com.aharam.tuition.service.FeeService;
import com.aharam.tuition.service.MarkService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/student-dashboard")
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
                .orElseThrow(() -> new EntityNotFoundException("Student profile not found."));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentDetailDto>> getProfile() {
        Student student = getAuthenticatedStudent();
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toStudentDetail(student), "Fetched student profile."));
    }

    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceSummaryDto>>> getAttendance() {
        Student student = getAuthenticatedStudent();
        List<AttendanceSummaryDto> records = attendanceService.getStudentAttendance(student.getStudentId()).stream()
                .map(ResponseMapper::toAttendance)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student attendance."));
    }

    @GetMapping("/fees")
    public ResponseEntity<ApiResponse<List<FeeStatusDto>>> getFees() {
        Student student = getAuthenticatedStudent();
        List<FeeStatusDto> records = feeService.getStudentFees(student.getStudentId()).stream()
                .map(ResponseMapper::toFeeStatus)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student fee history."));
    }

    @GetMapping("/marks")
    public ResponseEntity<ApiResponse<List<MarkEntryResponseDto>>> getMarks() {
        Student student = getAuthenticatedStudent();
        List<MarkEntryResponseDto> records = markService.getStudentResults(student.getStudentId()).stream()
                .map(ResponseMapper::toMarkEntry)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(records, "Fetched student marks."));
    }
}
