package com.aharam.tuition.repository;

import com.aharam.tuition.entity.User;
import com.aharam.tuition.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Boolean existsByEmail(String email);

    Boolean existsByUsername(String username);

    List<User> findByRole(Role role);

    long countByRoleAndActiveTrue(Role role);
}
