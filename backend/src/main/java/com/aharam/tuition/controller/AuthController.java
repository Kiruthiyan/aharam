package com.aharam.tuition.controller;

import com.aharam.tuition.dto.JwtResponse;
import com.aharam.tuition.dto.LoginRequest;
import com.aharam.tuition.dto.MessageResponse;
import com.aharam.tuition.dto.SignupRequest;
import com.aharam.tuition.dto.ChangePasswordRequest;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // DEBUGGING LOGS
        System.out.println(">>> CHECKING USER: " + loginRequest.getUsername());
        User user = userRepository.findByUsername(loginRequest.getUsername()).orElse(null);
        if (user != null) {
            System.out.println(">>> USER FOUND IN DB");
            System.out.println(">>> DB PASSWORD: " + user.getPassword());
            System.out.println(">>> RAW PASSWORD: " + loginRequest.getPassword());
            boolean matches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
            System.out.println(">>> PASSWORDS MATCH? " + matches);

            if (user.isAccountLocked()) {
                System.out.println(">>> ACCOUNT LOCKED");
                if (matches) {
                    System.out.println(">>> CORRECT PASSWORD PROVIDED. AUTO-UNLOCKING.");
                    user.setAccountLocked(false);
                    user.setFailedAttempts(0);
                    userRepository.save(user);
                } else {
                    return ResponseEntity.status(401).body(
                            new MessageResponse(
                                    "Account is locked due to too many failed attempts. Contact Super Admin."));
                }
            }
            if (user.getStatus() != com.aharam.tuition.entity.UserStatus.ACTIVE) {
                System.out.println(">>> ACCOUNT INACTIVE");
                return ResponseEntity.status(401).body(new MessageResponse("Account is inactive."));
            }
        } else {
            System.out.println(">>> USER NOT FOUND IN DB");
        }

        try {
            // 2. Attempt Authentication
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Note: authentication.getPrincipal() returns UserDetails, NOT our entity.
            // We already have 'user' entity from the check above.
            // If user was null (username not found), auth manager would have thrown
            // exceptions already.

            // 3. Reset failed attempts on success
            if (user != null) {
                user.setFailedAttempts(0);
                userRepository.save(user);
            }

            // 4. Return Response
            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getRole().name(),
                    user.isFirstLogin()));

        } catch (Exception e) {
            System.out.println(">>> AUTHENTICATION FAILED EXCEPTION: " + e.getClass().getName());
            System.out.println(">>> EXCEPTION MESSAGE: " + e.getMessage());
            e.printStackTrace();

            // 5. Handle Failure: Increment failed attempts
            if (user != null) {
                user.setFailedAttempts(user.getFailedAttempts() + 1);
                if (user.getFailedAttempts() >= 5) {
                    user.setAccountLocked(true);
                }
                userRepository.save(user);
            }
            return ResponseEntity.status(401).body(new MessageResponse("Invalid credentials"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRole(Role.STAFF); // Default

        String strRole = signUpRequest.getRole();
        if (strRole != null && strRole.equals("admin")) {
            user.setRole(Role.ADMIN);
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Incorrect old password!"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
}
