package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.StudentRegistrationRequest;
import com.aharam.tuition.dto.StudentUpdateRequest;
import com.aharam.tuition.dto.response.StudentDetailDto;
import com.aharam.tuition.dto.response.StudentPageDto;
import com.aharam.tuition.dto.response.StudentSummaryDto;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.StudentStatus;
import com.aharam.tuition.mapper.ResponseMapper;
import com.aharam.tuition.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/register")
    // @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('STAFF_ADMIN')") // Enable
    // when JWT fully tested linked to roles
    public ResponseEntity<ApiResponse<StudentDetailDto>> registerStudent(
            @Valid @RequestBody StudentRegistrationRequest student) {
        Student savedStudent = studentService.registerStudent(student);
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toStudentDetail(savedStudent),
                "Student registered successfully"));
    }

    @GetMapping("/check-id/{id}")
    public ResponseEntity<ApiResponse<Boolean>> checkId(@PathVariable String id) {
        boolean isTaken = studentService.isStudentIdTaken(id);
        return ResponseEntity.ok(ApiResponse.success(isTaken, "ID availability checked"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentSummaryDto>>> getAllStudents() {
        List<StudentSummaryDto> students = studentService.getAllStudents().stream()
                .map(ResponseMapper::toStudentSummary)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(students, "Fetched all students"));
    }

    @GetMapping("/query")
    public ResponseEntity<ApiResponse<StudentPageDto>> queryStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String center,
            @RequestParam(required = false) StudentStatus status,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "false") boolean archivedOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        StudentPageDto result = studentService.getStudentsPage(
                search,
                batch,
                center,
                status != null ? status.name() : null,
                includeDeleted,
                archivedOnly,
                page,
                size,
                sortBy,
                sortDir);
        return ResponseEntity.ok(ApiResponse.success(result, "Fetched students"));
    }

    @GetMapping("/archived")
    public ResponseEntity<ApiResponse<StudentPageDto>> getArchivedStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer batch,
            @RequestParam(required = false) String center,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        StudentPageDto result = studentService.getStudentsPage(
                search,
                batch,
                center,
                StudentStatus.INACTIVE.name(),
                true,
                true,
                page,
                size,
                "deletedAt",
                "desc");
        return ResponseEntity.ok(ApiResponse.success(result, "Fetched archived students"));
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<ApiResponse<StudentDetailDto>> getStudent(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "false") boolean includeDeleted) {
        Student student = studentService.getStudentById(studentId, includeDeleted);
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toStudentDetail(student), "Fetched student"));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<ApiResponse<StudentDetailDto>> updateStudent(
            @PathVariable String studentId,
            @Valid @RequestBody StudentUpdateRequest request) {
        Student updated = studentService.updateStudent(studentId, request);
        return ResponseEntity.ok(ApiResponse.success(ResponseMapper.toStudentDetail(updated), "Student updated successfully"));
    }

    @PostMapping("/{studentId}/deactivate")
    public ResponseEntity<ApiResponse<StudentDetailDto>> deactivateStudent(@PathVariable String studentId) {
        Student updated = studentService.deactivateStudent(studentId);
        return ResponseEntity.ok(
                ApiResponse.success(ResponseMapper.toStudentDetail(updated), "Student deactivated successfully"));
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<ApiResponse<String>> softDeleteStudent(@PathVariable String studentId) {
        studentService.softDeleteStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Student removed successfully"));
    }
}
