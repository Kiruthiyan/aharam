package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Student;
import com.aharam.tuition.service.StudentService;
import com.aharam.tuition.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @PostMapping("/register")
    // @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('STAFF_ADMIN')") // Enable
    // when JWT fully tested linked to roles
    public ResponseEntity<?> registerStudent(@RequestBody Student student) {
        try {
            Student savedStudent = studentService.registerStudent(student);
            return ResponseEntity.ok(ApiResponse.success(savedStudent, "Student registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "REGISTRATION_FAILED"));
        }
    }

    @GetMapping("/check-id/{id}")
    public ResponseEntity<ApiResponse<Boolean>> checkId(@PathVariable String id) {
        boolean isTaken = studentService.isStudentIdTaken(id);
        return ResponseEntity.ok(ApiResponse.success(isTaken, "ID availability checked"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudents(), "Fetched all students"));
    }
}
