package com.aharam.tuition.controller;

import com.aharam.tuition.dto.SignupRequest;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @PostMapping("/staff/register")
    // @PreAuthorize("hasRole('SUPER_ADMIN')") // TODO: Enable security
    public ResponseEntity<?> registerStaff(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Error: Username is already taken!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(encoder.encode(signUpRequest.getPassword())); // Temp password provided by Super Admin
        user.setRole(Role.STAFF_ADMIN);

        // We might want to store extra details like Full Name, Phone in a Staff Profile
        // entity later
        // For now, storing basic User info

        userRepository.save(user);

        return ResponseEntity.ok("Staff Admin registered successfully!");
    }

    @GetMapping("/staff")
    // @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STAFF_ADMIN)
                .toList();
        return ResponseEntity.ok(staff);
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("Staff removed successfully");
        }
        return ResponseEntity.badRequest().body("Staff not found");
    }
}
