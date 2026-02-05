package com.aharam.tuition.service;

import com.aharam.tuition.entity.Attendance;
import com.aharam.tuition.entity.Student;
import com.aharam.tuition.repository.AttendanceRepository;
import com.aharam.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    public Attendance markAttendance(String studentId, LocalDate date, Attendance.AttendanceStatus status,
            String recorder) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Attendance attendance = attendanceRepository.findByStudent_StudentIdAndDate(studentId, date)
                .orElse(new Attendance());

        attendance.setStudent(student);
        attendance.setDate(date);
        attendance.setStatus(status);
        attendance.setRecordedBy(recorder);

        return attendanceRepository.save(attendance);
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
