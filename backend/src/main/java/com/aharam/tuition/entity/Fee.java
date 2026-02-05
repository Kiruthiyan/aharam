package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "fees")
public class Fee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    private String month; // e.g., "January 2024"
    private Double amount;
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private String recordedBy;

    public enum PaymentStatus {
        PAID,
        PENDING,
        OVERDUE
    }
}
