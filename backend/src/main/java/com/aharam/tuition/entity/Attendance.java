package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "attendance", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "date" })
})
@SQLDelete(sql = "UPDATE attendance SET deleted_at = CURRENT_TIMESTAMP WHERE id=?")
@SQLRestriction("deleted_at IS NULL")
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceMethod method = AttendanceMethod.MANUAL;

    @ManyToOne
    @JoinColumn(name = "marked_by", referencedColumnName = "id")
    private User markedBy;

    private String batchOrClass;

    private String center;

    private java.time.LocalTime time;

    private String teacherNotes;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE
    }

    public enum AttendanceMethod {
        BARCODE,
        MANUAL
    }
}
