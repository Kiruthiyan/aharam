package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status;

    private String recordedBy; // Username of staff/admin

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        EXCUSED
    }
}
