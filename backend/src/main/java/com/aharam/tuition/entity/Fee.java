package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "fees", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "student_id", "academic_year", "month" })
})
public class Fee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    @Column(nullable = false)
    private String academicYear; // e.g. "2026"

    @Column(nullable = false)
    private String month; // e.g. "January"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status = FeeStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private UpdateMethod updateMethod;

    @ManyToOne
    @JoinColumn(name = "updated_by", referencedColumnName = "id")
    private User updatedBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Soft delete
    private LocalDateTime deletedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum FeeStatus {
        PAID, PENDING
    }

    public enum UpdateMethod {
        BARCODE, MANUAL
    }
}
