package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Data
public class Notice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1500)
    private String message;

    @Column(nullable = false)
    private String audience; // STAFF, STUDENTS, ALL

    @Column(nullable = false)
    private String channel; // APP, WHATSAPP, BOTH

    private String sentBy;
    private String sentByRole;

    @Column(nullable = false)
    private String at; // Storing as formatted string (e.g. DD/MM/YYYY HH:mm) for simplicity

    private String status; // SENT, PENDING, FAILED

    private Integer whatsappCount; // How many numbers it was sent to (if WHATSAPP)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
