package com.aharam.tuition.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "push_tokens")
@Data
public class PushToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // studentId or username that this token belongs to
    @Column(nullable = false)
    private String userId;

    // Expo push token format: ExponentPushToken[xxxxxx]
    @Column(nullable = false, unique = true)
    private String token;
}
