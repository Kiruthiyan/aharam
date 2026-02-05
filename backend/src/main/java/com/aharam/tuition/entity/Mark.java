package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "marks")
public class Mark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    private String examName; // e.g., "Term 1", "Unit Test 1"
    private String subject; // e.g., "Maths", "Science"

    private Double score;
    private Double maxScore;

    private String grade; // e.g., "A", "Pass"
    private LocalDate date;
}
