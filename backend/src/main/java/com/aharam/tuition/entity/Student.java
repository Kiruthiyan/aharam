package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "students")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(unique = true, nullable = false)
    private String studentId; // Manually entered ID, e.g., AHC-1001

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(unique = true, nullable = false)
    private String barcode;

    @Column(nullable = false)
    private String batchOrClass;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String fatherName;

    private String fatherOccupation;

    @Column(nullable = false)
    private String motherName;

    private String motherOccupation;

    private String guardianName;

    private String schoolName;

    @Column(nullable = false)
    private String center;

    @Column(nullable = false)
    private String medium;

    @Column(nullable = false)
    private Integer examBatch;

    private String subjects; // Comma separated

    @Column(columnDefinition = "TEXT")
    private String address;

    private String email;

    @Column(nullable = false)
    private String parentPhoneNumber;

    private String whatsappNumber;

    @Column(nullable = false, columnDefinition = "varchar(2) default 'EN'")
    private String languagePreference = "EN"; // EN or TA

    private LocalDate admissionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudentStatus status = StudentStatus.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    private LocalDateTime deletedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
