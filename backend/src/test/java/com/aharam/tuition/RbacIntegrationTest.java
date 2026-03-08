package com.aharam.tuition;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.support.IntegrationTestBase;
import com.aharam.tuition.support.TestFixtureFactory;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RbacIntegrationTest extends IntegrationTestBase {

    @Autowired
    private TestFixtureFactory fixtures;

    @Test
    void superAdminShouldMonitorButBeBlockedFromOperationalAttendanceFeesAndMarks() {
        User admin = fixtures.createUser(Role.SUPER_ADMIN, true);
        Student student = fixtures.createStudent("stud1Pass!");
        String token = loginAndGetToken(admin.getEmail(), "Passw0rd!");

        ResponseEntity<JsonNode> staffMgmt = exchangeWithToken(token, "/api/admin/staff", HttpMethod.GET, null);
        ResponseEntity<JsonNode> reports = exchangeWithToken(token, "/api/reports/summary", HttpMethod.GET, null);
        ResponseEntity<JsonNode> feeSummary = exchangeWithToken(token, "/api/fees/admin/summary?academicYear=2026", HttpMethod.GET, null);
        ResponseEntity<JsonNode> attendanceMonitor = exchangeWithToken(
                token,
                "/api/attendance/batch/2026?start=2026-01-01&end=2026-01-31",
                HttpMethod.GET,
                null);

        ResponseEntity<JsonNode> markManualForbidden = exchangeWithToken(
                token,
                "/api/attendance/mark-manual",
                HttpMethod.POST,
                Map.of(
                        "studentId", student.getStudentId(),
                        "date", LocalDate.now().toString(),
                        "status", "PRESENT",
                        "staffId", admin.getId()));
        ResponseEntity<JsonNode> feeUpdateForbidden = exchangeWithToken(
                token,
                "/api/fees/manual",
                HttpMethod.POST,
                Map.of(
                        "studentId", student.getStudentId(),
                        "month", "January",
                        "academicYear", "2026",
                        "status", "PAID",
                        "staffId", admin.getId()));
        ResponseEntity<JsonNode> marksSaveForbidden = exchangeWithToken(
                token,
                "/api/marks/bulk-save",
                HttpMethod.POST,
                Map.of(
                        "examId", 1,
                        "staffId", admin.getId(),
                        "entries", List.of(Map.of("studentId", student.getStudentId(), "score", 90, "remarks", "good"))));

        assertThat(staffMgmt.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(reports.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(feeSummary.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(attendanceMonitor.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(markManualForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(feeUpdateForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(marksSaveForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void staffShouldAccessOperationalRoutesButBeBlockedFromAdminOnlyRoutes() {
        User staff = fixtures.createUser(Role.STAFF, true);
        Student student = fixtures.createStudent("stud2Pass!");
        String token = loginAndGetToken(staff.getEmail(), "Passw0rd!");

        ResponseEntity<JsonNode> students = exchangeWithToken(token, "/api/students", HttpMethod.GET, null);
        ResponseEntity<JsonNode> attendance = exchangeWithToken(
                token,
                "/api/attendance/mark-manual",
                HttpMethod.POST,
                Map.of(
                        "studentId", student.getStudentId(),
                        "date", LocalDate.now().toString(),
                        "status", "PRESENT",
                        "staffId", staff.getId()));
        ResponseEntity<JsonNode> fees = exchangeWithToken(
                token,
                "/api/fees/manual",
                HttpMethod.POST,
                Map.of(
                        "studentId", student.getStudentId(),
                        "month", "January",
                        "academicYear", "2026",
                        "status", "PAID",
                        "staffId", staff.getId()));

        ResponseEntity<JsonNode> examCreate = exchangeWithToken(
                token,
                "/api/marks/exams/create?staffId=" + staff.getId(),
                HttpMethod.POST,
                Map.of(
                        "name", "Term 1",
                        "batch", "2026",
                        "subject", "Mathematics",
                        "maxMarks", 100.0,
                        "examDate", "2026-02-15",
                        "status", "UPCOMING"));

        Long examId = examCreate.getBody().path("data").path("id").asLong();
        ResponseEntity<JsonNode> marks = exchangeWithToken(
                token,
                "/api/marks/bulk-save",
                HttpMethod.POST,
                Map.of(
                        "examId", examId,
                        "staffId", staff.getId(),
                        "entries", List.of(Map.of(
                                "studentId", student.getStudentId(),
                                "score", 88,
                                "remarks", "Solid"))));

        ResponseEntity<JsonNode> staffMgmtForbidden = exchangeWithToken(token, "/api/admin/staff", HttpMethod.GET, null);
        ResponseEntity<JsonNode> reportsForbidden = exchangeWithToken(token, "/api/reports/summary", HttpMethod.GET, null);
        ResponseEntity<JsonNode> adminSettingsForbidden = exchangeWithToken(token, "/api/admin/ping", HttpMethod.GET, null);
        ResponseEntity<JsonNode> adminSummaryForbidden = exchangeWithToken(token, "/api/fees/admin/summary?academicYear=2026", HttpMethod.GET, null);

        assertThat(students.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(attendance.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fees.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(examCreate.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(marks.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(staffMgmtForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(reportsForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(adminSettingsForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(adminSummaryForbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void studentShouldOnlyAccessOwnDashboardAndBeBlockedFromStaffAndAdminRoutes() {
        Student studentA = fixtures.createStudent("studApass1!");
        Student studentB = fixtures.createStudent("studBpass1!");
        String studentToken = loginAndGetToken(studentA.getUser().getEmail(), "studApass1!");

        ResponseEntity<JsonNode> profile = exchangeWithToken(studentToken, "/api/student-dashboard/profile", HttpMethod.GET, null);
        ResponseEntity<JsonNode> attendance = exchangeWithToken(studentToken, "/api/student-dashboard/attendance", HttpMethod.GET, null);
        ResponseEntity<JsonNode> marks = exchangeWithToken(studentToken, "/api/student-dashboard/marks", HttpMethod.GET, null);
        ResponseEntity<JsonNode> fees = exchangeWithToken(studentToken, "/api/student-dashboard/fees", HttpMethod.GET, null);

        ResponseEntity<JsonNode> cannotListStudents = exchangeWithToken(studentToken, "/api/students", HttpMethod.GET, null);
        ResponseEntity<JsonNode> cannotAccessAdmin = exchangeWithToken(studentToken, "/api/admin/staff", HttpMethod.GET, null);
        ResponseEntity<JsonNode> cannotAccessOtherStudentData = exchangeWithToken(
                studentToken,
                "/api/fees/student/" + studentB.getStudentId(),
                HttpMethod.GET,
                null);
        ResponseEntity<JsonNode> cannotMarkAttendance = exchangeWithToken(
                studentToken,
                "/api/attendance/mark-manual",
                HttpMethod.POST,
                Map.of(
                        "studentId", studentA.getStudentId(),
                        "date", LocalDate.now().toString(),
                        "status", "PRESENT",
                        "staffId", 1));

        assertThat(profile.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(profile.getBody().path("data").path("studentId").asText()).isEqualTo(studentA.getStudentId());
        assertThat(attendance.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(marks.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fees.getStatusCode()).isEqualTo(HttpStatus.OK);

        assertThat(cannotListStudents.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(cannotAccessAdmin.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(cannotAccessOtherStudentData.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(cannotMarkAttendance.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }
}
