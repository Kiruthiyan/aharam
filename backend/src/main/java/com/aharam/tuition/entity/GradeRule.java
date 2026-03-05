package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "grade_rules")
public class GradeRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String gradeLetter;

    @Column(nullable = false)
    private Double minPercentage;

    @Column(nullable = false)
    private Double maxPercentage;
}
