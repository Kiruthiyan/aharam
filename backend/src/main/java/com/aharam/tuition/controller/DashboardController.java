package com.aharam.tuition.controller;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.repository.AttendanceRepository;
import com.aharam.tuition.repository.FeeRepository;
import com.aharam.tuition.repository.NotificationLogRepository;
import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Fee;
import com.aharam.tuition.entity.NotificationLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    AttendanceRepository attendanceRepository;

    @Autowired
    FeeRepository feeRepository;

    @Autowired
    NotificationLogRepository notificationLogRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        boolean isSuperAdmin = false;
        boolean isStaff = false;
        User currentUser = null;

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null && auth.getName() != null) {
            isSuperAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
            isStaff = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));
            currentUser = userRepository.findByEmail(auth.getName()).orElse(null);
        }

        Map<String, Object> stats = new HashMap<>();
        long totalStudents = studentRepository.count();
        stats.put("totalStudents", totalStudents);

        LocalDate today = LocalDate.now();

        if (isSuperAdmin) {
            long totalStaff = userRepository.findAll().stream().filter(u -> u.getRole() == Role.STAFF).count();
            stats.put("totalStaff", totalStaff);

            // Basic Aggregates
            List<Student> allStudents = studentRepository.findAll();
            // Since gender is not on Student entity, we omit the breakdown for now
            long totalBoys = 0;
            long totalGirls = 0;

            stats.put("totalBatches", 5); // Assuming static batches for now
            stats.put("totalBoys", totalBoys);
            stats.put("totalGirls", totalGirls);

            // Attendance
            List<Attendance> todaysAttendance = attendanceRepository.findByDate(today);
            long presentToday = todaysAttendance.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus().name())
                    || "LATE".equalsIgnoreCase(a.getStatus().name())).count();
            long absentToday = todaysAttendance.stream().filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus().name()))
                    .count();

            stats.put("todayPresent", presentToday);
            stats.put("todayAbsent", absentToday);

            double overallAttendancePct = totalStudents > 0 ? ((double) presentToday / totalStudents) * 100 : 0;
            stats.put("overallAttendancePct", Math.round(overallAttendancePct));

            // Fees
            stats.put("feesPaidCount", 0); // Need broader logic for fees, temporary 0
            stats.put("feesPendingCount", 0);

            // Recent Notification Logs
            List<Map<String, String>> logs = new java.util.ArrayList<>();
            List<NotificationLog> recentNotifs = notificationLogRepository.findAll().stream()
                    .sorted((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()))
                    .limit(5)
                    .collect(Collectors.toList());

            for (NotificationLog log : recentNotifs) {
                Map<String, String> logMap = new HashMap<>();
                logMap.put("action", "Announcement Broadcast");
                // The NotificationLog entity doesn't have sentBy, sentByRole, or audience
                // fields
                // So using simple static texts here as placeholders for missing data
                logMap.put("actor", "System/Admin");
                logMap.put("role", "ADMIN");
                logMap.put("details", "Channel: " + log.getChannel() + ", Target: " + log.getUserId());
                logMap.put("at", log.getCreatedAt().format(DateTimeFormatter.ofPattern("hh:mm a")));
                logs.add(logMap);
            }
            stats.put("recentLogs", logs);

        } else if (isStaff && currentUser != null) {
            // Staff specific logic
            // Assuming no assigned staff direct mapping logic for now to fix compile error
            long assignedCount = 0;
            stats.put("assignedStudents", assignedCount);

            long staffPresentToday = 0;

            stats.put("todaysAttendance", staffPresentToday);
            stats.put("todayPresent", staffPresentToday);
            stats.put("pendingFees", 0);
        }

        return ResponseEntity.ok(stats);
    }
}
