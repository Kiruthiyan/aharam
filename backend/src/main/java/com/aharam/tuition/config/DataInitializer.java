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
        String[] oldUsers = { "aharam", "aharam_admin", "admin_user", "admin1", "admin2", "admin" };
        for (String oldUser : oldUsers) {
            Optional<User> user = userRepository.findByEmail(oldUser + "@aharam.com");
            if (user.isPresent()) {
                userRepository.delete(user.get());
                System.out.println("Removed legacy user: " + oldUser);
            }
        }

        // ==========================================
        // Create MAIN ADMIN (admin@aharam.com / 12345678)
        // ==========================================
        User admin = userRepository.findByEmail("admin@aharam.com").orElse(new User());
        admin.setFullName("Super Admin");
        admin.setEmail("admin@aharam.com");
        admin.setPassword(passwordEncoder.encode("12345678"));
        admin.setRole(Role.SUPER_ADMIN);
        admin.setActive(true);
        admin.setPasswordChangeRequired(false);
        userRepository.save(admin);
        System.out.println("Created Main Admin: 'admin@aharam.com' with password '12345678'");

        // ==========================================
        // Create STAFF ACCOUNT (kiruthiyan7@gmail.com / 12345678)
        // ==========================================
        User personalAdmin = userRepository.findByEmail("kiruthiyan7@gmail.com").orElse(new User());
        personalAdmin.setFullName("Kiruthiyan");
        personalAdmin.setEmail("kiruthiyan7@gmail.com");
        personalAdmin.setPassword(passwordEncoder.encode("12345678"));
        personalAdmin.setRole(Role.STAFF);
        personalAdmin.setActive(true);
        personalAdmin.setPasswordChangeRequired(false);
        userRepository.save(personalAdmin);
        System.out.println("Created Staff Account: 'kiruthiyan7@gmail.com' with password '12345678'");

        System.out.println("Data Initialization Complete.");
    }
}
