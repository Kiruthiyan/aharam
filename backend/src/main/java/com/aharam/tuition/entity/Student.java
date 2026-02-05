package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(unique = true, nullable = false)
    private String studentId; // Manually entered ID, e.g., AHC-1001

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String fatherName;

    @Column(nullable = false)
    private String motherName;

    private String guardianName;

    private String schoolName;

    // Derived from ID logic: KT2026xxx
    // Center: K (Kokuvil) / M (Mallakam)
    @Column(nullable = false)
    private String center;

    // Medium: T (Tamil) / E (English)
    @Column(nullable = false)
    private String medium;

    // Exam Year: 2026, 2027...
    @Column(nullable = false)
    private Integer examBatch;

    private String subjects; // Comma separated

    @Column(columnDefinition = "TEXT")
    private String address;

    private String email;

    @Column(nullable = false)
    private String parentPhoneNumber;

    private LocalDate admissionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status = StudentStatus.ACTIVE;
}
