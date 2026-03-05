package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "academic_results", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "exam_id" })
})
public class Mark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    @Column(nullable = false)
    private Double marksObtained;

    @Column(nullable = false)
    private String grade; // Store as String now (A, B, C, S, F)

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "entered_by", referencedColumnName = "id")
    private User enteredBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
