package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notices")
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title_en", nullable = false)
    private String titleEn; // English Title

    @Column(name = "title_ta", nullable = false)
    private String titleTa; // Tamil Title

    @Column(name = "content_en", nullable = false, columnDefinition = "TEXT")
    private String contentEn; // English Content

    @Column(name = "content_ta", nullable = false, columnDefinition = "TEXT")
    private String contentTa; // Tamil Content

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience")
    private Role targetAudience; // NULL = All, or specifically 'STUDENT' / 'STAFF'

    @ManyToOne
    @JoinColumn(name = "created_by", referencedColumnName = "id")
    private User createdBy;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
