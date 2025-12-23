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
    private String studentId; // Manually entered ID

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String fatherName;

    @Column(nullable = false)
    private String motherName;

    private String guardianName;

    private String schoolName;

    private String subjects; // Comma separated for now

    @Column(columnDefinition = "TEXT")
    private String address;

    private String email;

    @Column(nullable = false)
    private String parentPhoneNumber;

    private LocalDate admissionDate;

    @Column(nullable = false)
    private boolean active = true;
}
