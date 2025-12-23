package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Student;
import com.aharam.tuition.service.StudentService;
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
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/check-id/{id}")
    public ResponseEntity<?> checkId(@PathVariable String id) {
        return ResponseEntity.ok(studentService.isStudentIdTaken(id));
    }
}
