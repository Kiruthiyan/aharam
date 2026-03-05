package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "actor_id", referencedColumnName = "id")
    private User actor; // Who performed the action

    @Column(nullable = false)
    private String actionType; // e.g., 'UPDATE_FEE', 'MARK_ATTENDANCE'

    @Column(nullable = false)
    private String targetResource; // e.g., 'STUDENT_FEES'

    private Long resourceId;

    private String ipAddress;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
