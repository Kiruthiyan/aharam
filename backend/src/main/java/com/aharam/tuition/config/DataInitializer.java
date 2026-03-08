package com.aharam.tuition.config;

import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Value("${app.seed.default-admin.enabled:false}")
    private boolean defaultAdminEnabled;

    @Value("${app.seed.default-admin.name:}")
    private String defaultAdminName;

    @Value("${app.seed.default-admin.email:}")
    private String defaultAdminEmail;

    @Value("${app.seed.default-admin.password:}")
    private String defaultAdminPassword;

    @Value("${app.seed.default-staff.enabled:false}")
    private boolean defaultStaffEnabled;

    @Value("${app.seed.default-staff.name:}")
    private String defaultStaffName;

    @Value("${app.seed.default-staff.email:}")
    private String defaultStaffEmail;

    @Value("${app.seed.default-staff.password:}")
    private String defaultStaffPassword;

    @Override
    public void run(String... args) throws Exception {
        if (!defaultAdminEnabled && !defaultStaffEnabled) {
            System.out.println("Data initialization skipped (all seed users disabled).");
            return;
        }

        if (defaultAdminEnabled) {
            seedUser(
                    defaultAdminName,
                    defaultAdminEmail,
                    defaultAdminPassword,
                    Role.SUPER_ADMIN,
                    "default super admin");
        } else {
            System.out.println("Default super admin seed skipped (disabled).");
        }

        if (defaultStaffEnabled) {
            seedUser(
                    defaultStaffName,
                    defaultStaffEmail,
                    defaultStaffPassword,
                    Role.STAFF,
                    "default staff");
        } else {
            System.out.println("Default staff seed skipped (disabled).");
        }
    }

    private void seedUser(String fullName, String email, String password, Role role, String label) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            System.out.println("Seed skipped for " + label + " (missing credentials).");
            return;
        }

        User user = userRepository.findByEmail(email).orElse(new User());
        user.setUsername(email.split("@")[0]);
        user.setFullName(fullName == null || fullName.isBlank() ? defaultNameForRole(role) : fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        user.setPasswordChangeRequired(true);
        userRepository.save(user);
        System.out.println("Initialized " + label + " account: " + email);
    }

    private String defaultNameForRole(Role role) {
        return role == Role.SUPER_ADMIN ? "Super Admin" : "Staff User";
    }
}
