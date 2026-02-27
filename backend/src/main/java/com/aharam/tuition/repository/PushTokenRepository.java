package com.aharam.tuition.repository;

import com.aharam.tuition.entity.PushToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushTokenRepository extends JpaRepository<PushToken, Long> {
    List<PushToken> findByUserId(String userId);

    Optional<PushToken> findByToken(String token);

    boolean existsByToken(String token);
}
