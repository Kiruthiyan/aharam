package com.aharam.tuition.config;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Initializing Data...");

        // CLEANUP: Remove old conflicting accounts
        String[] oldUsers = { "aharam", "aharam_admin", "admin_user", "admin1", "admin2" };
        for (String oldUser : oldUsers) {
            Optional<User> user = userRepository.findByUsername(oldUser);
            if (user.isPresent()) {
                userRepository.delete(user.get());
                System.out.println("Removed legacy user: " + oldUser);
            }
        }

        // ==========================================
        // Create MAIN ADMIN (admin / 12345678)
        // ==========================================
        User admin = userRepository.findByUsername("admin").orElse(new User());
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("12345678"));
        admin.setRole(Role.ADMIN);
        admin.setStatus(com.aharam.tuition.entity.UserStatus.ACTIVE);
        admin.setFirstLogin(true);
        admin.setAccountLocked(false);
        admin.setFailedAttempts(0);
        userRepository.save(admin);
        System.out.println("Created Main Admin: 'admin' with password '12345678'");

        System.out.println("Data Initialization Complete.");
    }
}
