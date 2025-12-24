package com.aharam.tuition.config;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        User admin;
        if (userRepository.existsByUsername("aharam")) {
            User existing = userRepository.findByUsername("aharam").orElseThrow();
            userRepository.delete(existing);
            System.out.println("Deleted existing Super Admin 'aharam' to ensure clean state.");
        }

        admin = new User();
        admin.setUsername("aharam");
        System.out.println("Creating new Super Admin 'aharam'.");

        admin.setPassword(passwordEncoder.encode("20130427"));
        admin.setRole(Role.SUPER_ADMIN);
        userRepository.save(admin);

        System.out.println("Super Admin credentials confirmed: username=aharam, password=20130427");
    }
}
