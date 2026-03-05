package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "studentId")
    private Student student;

    @Column(nullable = false)
    private String module; // ATTENDANCE, FEES, ACADEMICS, CUSTOM

    @Column(nullable = false)
    private String channel; // WHATSAPP, SMS, APP_PUSH

    @Column(nullable = false)
    private String targetNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, SENT, FAILED

    @Column(columnDefinition = "TEXT")
    private String errorReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by", referencedColumnName = "id")
    private User triggeredBy;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime triggeredAt = LocalDateTime.now();

    private LocalDateTime completedAt;
}
