package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Map;

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
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
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
        String currentAcademicYear = String.valueOf(today.getYear());
        long paidForYear = feeRepository.countByAcademicYearAndStatusAndDeletedAtIsNull(
                currentAcademicYear, Fee.FeeStatus.PAID);
        long pendingForYear = feeRepository.countByAcademicYearAndStatusAndDeletedAtIsNull(
                currentAcademicYear, Fee.FeeStatus.PENDING);
        long feesPaidCount = paidForYear;
        long feesPendingCount = pendingForYear;
        if (feesPaidCount + feesPendingCount == 0) {
            feesPaidCount = feeRepository.countByStatusAndDeletedAtIsNull(Fee.FeeStatus.PAID);
            feesPendingCount = feeRepository.countByStatusAndDeletedAtIsNull(Fee.FeeStatus.PENDING);
        }

        if (isSuperAdmin) {
            long totalStaff = userRepository.countByRoleAndActiveTrue(Role.STAFF);
            stats.put("totalStaff", totalStaff);

            stats.put("totalBatches", studentRepository.countDistinctBatches());
            stats.put("totalCenters", studentRepository.countDistinctCenters());
            long totalBoys = studentRepository.countMaleStudents();
            long totalGirls = studentRepository.countFemaleStudents();
            stats.put("totalBoys", totalBoys);
            stats.put("totalGirls", totalGirls);

            long presentToday = attendanceRepository.countByDateAndStatusIn(
                    today,
                    List.of(Attendance.AttendanceStatus.PRESENT, Attendance.AttendanceStatus.LATE));
            long absentToday = attendanceRepository.countByDateAndStatus(today, Attendance.AttendanceStatus.ABSENT);

            stats.put("todayPresent", presentToday);
            stats.put("todayAbsent", absentToday);

            double overallAttendancePct = totalStudents > 0 ? ((double) presentToday / totalStudents) * 100 : 0;
            stats.put("overallAttendancePct", Math.round(overallAttendancePct));

            stats.put("feesPaidCount", feesPaidCount);
            stats.put("feesPendingCount", feesPendingCount);

            List<Map<String, String>> logs = new ArrayList<>();
            List<NotificationLog> recentNotifs = notificationLogRepository.findTop5ByOrderByTriggeredAtDesc();

            for (NotificationLog log : recentNotifs) {
                Map<String, String> logMap = new HashMap<>();
                String actorName = log.getTriggeredBy() != null ? log.getTriggeredBy().getFullName() : "System";
                String actorRole = log.getTriggeredBy() != null && log.getTriggeredBy().getRole() != null
                        ? log.getTriggeredBy().getRole().name()
                        : "SYSTEM";
                logMap.put("action", (log.getModule() == null ? "Notification" : log.getModule()) + " update");
                logMap.put("actor", actorName);
                logMap.put("role", actorRole);
                logMap.put("details",
                        "Channel: " + (log.getChannel() == null ? "-" : log.getChannel()) +
                                ", Target: " + (log.getTargetNumber() == null ? "-" : log.getTargetNumber()) +
                                ", Status: " + (log.getStatus() == null ? "-" : log.getStatus()));
                logMap.put("at", log.getTriggeredAt() == null ? ""
                        : log.getTriggeredAt().format(DateTimeFormatter.ofPattern("hh:mm a")));
                logs.add(logMap);
            }
            stats.put("recentLogs", logs);

        } else if (isStaff && currentUser != null) {
            final User userCtx = currentUser;
            Set<String> assignedStudentIds = new HashSet<>(studentRepository.findStudentIdsByCreator(userCtx.getId()));

            // Removed fallback logic: staff should only see students they've explicitly assigned
            // if (assignedStudentIds.isEmpty()) {
            //     assignedStudentIds.addAll(studentRepository.findAllStudentIds());
            // }
            
            final Set<String> finalAssignedStudentIds = assignedStudentIds;
            long assignedCount = assignedStudentIds.size();
            stats.put("assignedStudents", assignedCount);

            long staffPresentToday = attendanceRepository.countDistinctStudentsMarkedByStaffOnDate(today, userCtx.getId());
            stats.put("todaysAttendance", staffPresentToday);
            stats.put("todayPresent", staffPresentToday);

            long pendingFees = finalAssignedStudentIds.isEmpty()
                    ? 0L
                    : feeRepository.countByAcademicYearAndStatusAndStudentIds(
                            currentAcademicYear,
                            Fee.FeeStatus.PENDING,
                            finalAssignedStudentIds.stream().toList());
            if (pendingFees == 0 && !finalAssignedStudentIds.isEmpty()) {
                pendingFees = feeRepository.countByStatusAndStudentIds(
                        Fee.FeeStatus.PENDING,
                        finalAssignedStudentIds.stream().toList());
            }
            stats.put("pendingFees", pendingFees);
        }

        return ResponseEntity.ok(ApiResponse.success(stats, "Fetched dashboard stats"));
    }
}
