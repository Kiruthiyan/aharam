package com.aharam.tuition.service;

import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.AttendanceRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Attendance markAttendance(String studentId, LocalDate date, Attendance.AttendanceStatus status,
                             Long staffId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        User staff = userRepository.findById(staffId).orElse(null);

        Attendance attendance = attendanceRepository.findByStudent_StudentIdAndDate(studentId, date)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);
        attendance.setMarkedBy(staff);
        if (attendance.getTime() == null && status == Attendance.AttendanceStatus.PRESENT) {
            attendance.setTime(LocalTime.now());
        }

        Attendance saved = attendanceRepository.save(attendance);

        // Notify parent
        String emoji = (status == Attendance.AttendanceStatus.PRESENT) ? "✅" : (status == Attendance.AttendanceStatus.LATE ? "⏳" : "❌");
        String statusWord = status.name().toLowerCase();
        notificationService.sendToUser(
                studentId,
                emoji + " Attendance — " + date,
                student.getFullName() + " is " + statusWord + " today.");

        return saved;
    }

    @Transactional
    public Attendance scanBarcode(String barcode, Long staffId, String batch, String center) {
        Student student = studentRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Invalid barcode: Student not found"));

        User staff = userRepository.findById(staffId).orElse(null);
        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findByStudent_StudentIdAndDate(student.getStudentId(), today)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(today);
        attendance.setTime(LocalTime.now());
        attendance.setStatus(Attendance.AttendanceStatus.PRESENT);
        attendance.setMethod(Attendance.AttendanceMethod.BARCODE);
        attendance.setMarkedBy(staff);
        attendance.setBatchOrClass(batch);
        attendance.setCenter(center);

        Attendance saved = attendanceRepository.save(attendance);

        notificationService.sendToUser(
                student.getStudentId(),
                "✅ Attendance Marked",
                student.getFullName() + " arrived at " + attendance.getTime());

        return saved;
    }

    @Transactional
    public void autoAbsentRemainder(String batch, LocalDate date, Long staffId) {
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> s.getBatchOrClass().equalsIgnoreCase(batch))
                .toList();

        User staff = userRepository.findById(staffId).orElse(null);

        for (Student s : students) {
            if (attendanceRepository.findByStudent_StudentIdAndDate(s.getStudentId(), date).isEmpty()) {
                Attendance abs = new Attendance();
                abs.setStudent(s);
                abs.setDate(date);
                abs.setStatus(Attendance.AttendanceStatus.ABSENT);
                abs.setMethod(Attendance.AttendanceMethod.MANUAL);
                abs.setMarkedBy(staff);
                abs.setBatchOrClass(batch);
                attendanceRepository.save(abs);
            }
        }
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<Attendance> getStudentAttendance(String studentId) {
        return attendanceRepository.findByStudent_StudentId(studentId);
    }

    public List<Attendance> getBatchAttendance(LocalDate start, LocalDate end, Integer batch) {
        return attendanceRepository.findByDateBetweenAndStudent_ExamBatch(start, end, batch);
    }
}
