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
        boolean isSuperAdmin = false;
        boolean isStaff = false;

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            isSuperAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            isStaff = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());

        if (isSuperAdmin) {
            long totalStaff = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STAFF).count();
            stats.put("totalStaff", totalStaff);
            stats.put("totalBatches", 5);
            stats.put("totalBoys", 150);
            stats.put("totalGirls", 120);
            stats.put("todayPresent", 250);
            stats.put("todayAbsent", 20);
            stats.put("overallAttendancePct", 92);
            stats.put("feesPaidCount", 200);
            stats.put("feesPendingCount", 70);
            
            // Mock Activity Logs
            java.util.List<Map<String, String>> logs = new java.util.ArrayList<>();
            Map<String, String> log1 = new HashMap<>();
            log1.put("action", "Staff Logged In");
            log1.put("actor", "Jane Doe");
            log1.put("role", "STAFF");
            log1.put("at", "10:30 AM");
            logs.add(log1);
            stats.put("recentLogs", logs);

        } else if (isStaff) {
            stats.put("assignedStudents", 120); 
            stats.put("todaysAttendance", 100);
            stats.put("todayPresent", 100); 
            stats.put("pendingFees", 15);
        }

        return ResponseEntity.ok(stats);
    }
}
