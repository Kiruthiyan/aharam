package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "exams")
@SQLDelete(sql = "UPDATE exams SET deleted_at = CURRENT_TIMESTAMP WHERE id=?")
@SQLRestriction("deleted_at IS NULL")
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Term 1 Final", "Monthly Test - Feb"

    @Column(nullable = false)
    private String batch; // e.g., "2026"

    @Column(nullable = false)
    private String subject; // e.g., "Maths"

    @Column(nullable = false)
    private Double maxMarks = 100.0;

    @Column(nullable = false)
    private LocalDate examDate;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdBy;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime deletedAt;

    @Enumerated(EnumType.STRING)
    private ExamStatus status = ExamStatus.UPCOMING;

    public enum ExamStatus {
        UPCOMING,
        COMPLETED,
        ARCHIVED
    }
}
