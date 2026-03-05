package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.JwtResponse;
import com.aharam.tuition.dto.LoginRequest;
import com.aharam.tuition.dto.SignupRequest;
import com.aharam.tuition.dto.ChangePasswordRequest;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.repository.StudentRepository;
import com.aharam.tuition.security.JwtUtils;
import com.aharam.tuition.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getUsername()).orElse(null);

        if (user != null) {
            if (!user.isActive()) {
                return ResponseEntity.status(401).body(ApiResponse.error("Account is inactive.", "ACCOUNT_INACTIVE"));
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            String displayName = user != null ? user.getFullName() : loginRequest.getUsername();

            JwtResponse resp = new JwtResponse(
                    jwt,
                    user != null ? user.getId() : 0L,
                    user != null ? user.getEmail() : loginRequest.getUsername(),
                    displayName,
                    user != null ? user.getRole().name() : "",
                    user != null ? user.isPasswordChangeRequired() : false);

            return ResponseEntity.ok(ApiResponse.success(resp, "Login successful"));

        } catch (Exception e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials", "AUTH_FAILED"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already taken!", "EMAIL_EXISTS"));
        }

        User user = new User();
        user.setFullName(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));

        String strRole = signUpRequest.getRole();
        if ("super_admin".equalsIgnoreCase(strRole)) {
            user.setRole(Role.SUPER_ADMIN);
        } else {
            user.setRole(Role.STAFF);
        }

        user.setActive(true);
        user.setPasswordChangeRequired(true);

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(null, "User registered successfully!"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Incorrect old password!", "INVALID_PASSWORD"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangeRequired(false);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully!"));
    }

    // --- FORGOT PASSWORD OTP FLOW ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address.", "USER_NOT_FOUND"));
        }

        String otp = generateOtp();
        user.setPasswordResetToken(otp);
        user.setPasswordResetExpires(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendOtpEmail(email, otp, "Password Reset");

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset OTP sent to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address.", "USER_NOT_FOUND"));
        }
        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(otp)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid OTP.", "INVALID_OTP"));
        }
        if (user.getPasswordResetExpires() == null || LocalDateTime.now().isAfter(user.getPasswordResetExpires())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("OTP has expired. Please request a new one.", "EXPIRED_OTP"));
        }

        return ResponseEntity.ok(ApiResponse.success(null, "OTP verified successfully."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address.", "USER_NOT_FOUND"));
        }
        if (user.getPasswordResetToken() == null || !user.getPasswordResetToken().equals(otp)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid OTP.", "INVALID_OTP"));
        }
        if (user.getPasswordResetExpires() == null || LocalDateTime.now().isAfter(user.getPasswordResetExpires())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("OTP has expired. Please request a new one.", "EXPIRED_OTP"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        user.setPasswordChangeRequired(false);
        userRepository.save(user);

        return ResponseEntity.ok(
                ApiResponse.success(null, "Password reset successfully. You can now log in with your new password."));
    }
}
