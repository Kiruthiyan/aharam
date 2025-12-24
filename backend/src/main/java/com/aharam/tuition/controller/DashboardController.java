package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        // Disabled Security Logic for Debugging
        boolean isSuperAdmin = false;

        Map<String, Object> stats = new HashMap<>();

        // Common Stats
        stats.put("totalStudents", studentRepository.count());

        if (isSuperAdmin) {
            // Super Admin Only Stats
            long totalStaff = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STAFF).count();
            stats.put("totalStaff", totalStaff);
            stats.put("monthlyIncome", 245000); // Mock
            stats.put("pendingFees", 45); // Mock
        } else {
            // Staff Admin View
            stats.put("assignedStudents", 120); // Mock
            stats.put("todaysAttendance", 480); // Mock
        }

        return ResponseEntity.ok(stats);
    }
}
