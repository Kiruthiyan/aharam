package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "fee_logs")
public class FeeLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fee_id")
    private Fee fee;

    @Enumerated(EnumType.STRING)
    private Fee.FeeStatus oldStatus;

    @Enumerated(EnumType.STRING)
    private Fee.FeeStatus newStatus;

    @ManyToOne
    @JoinColumn(name = "changed_by", referencedColumnName = "id")
    private User changedBy;

    @Enumerated(EnumType.STRING)
    private Fee.UpdateMethod method;

    private LocalDateTime changedAt = LocalDateTime.now();
}
