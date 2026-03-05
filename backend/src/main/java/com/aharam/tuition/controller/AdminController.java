package com.aharam.tuition.controller;

import com.aharam.tuition.dto.SignupRequest;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.aharam.tuition.entity.OtpVerification;
import com.aharam.tuition.repository.OtpVerificationRepository;
import com.aharam.tuition.service.EmailService;
import com.aharam.tuition.dto.ApiResponse;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    OtpVerificationRepository otpVerificationRepository;

    @Autowired
    EmailService emailService;

    @Autowired
    PasswordEncoder encoder;

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @PostMapping("/staff/send-verification-code")
    public ResponseEntity<ApiResponse<String>> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required", "EMAIL_REQUIRED"));
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: Email is already registered!", "EMAIL_EXISTS"));
        }

        String otp = generateOtp();

        OtpVerification otpEntity = new OtpVerification();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiry(LocalDateTime.now().plusMinutes(15));
        otpEntity.setVerified(false);

        otpVerificationRepository.save(otpEntity);

        emailService.sendOtpEmail(email, otp, "Staff Registration");

        return ResponseEntity.ok(ApiResponse.success(null, "Verification code sent to " + email));
    }

    @PostMapping("/staff/verify-email-code")
    public ResponseEntity<ApiResponse<String>> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email and OTP are required", "MISSING_FIELDS"));
        }

        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);

        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No verification code found for this email", "NO_OTP_FOUND"));
        }

        OtpVerification otpEntity = otpOpt.get();

        if (otpEntity.isExpired()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Verification code has expired", "OTP_EXPIRED"));
        }

        if (!otpEntity.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid verification code", "INVALID_OTP"));
        }

        otpEntity.setVerified(true);
        otpVerificationRepository.save(otpEntity);

        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/staff/register")
    public ResponseEntity<ApiResponse<String>> registerStaff(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: Email is already taken!", "EMAIL_EXISTS"));
        }

        Optional<OtpVerification> otpOpt = otpVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(signUpRequest.getEmail());
        if (otpOpt.isEmpty() || !otpOpt.get().isVerified()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error: Email has not been verified!", "EMAIL_NOT_VERIFIED"));
        }

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setFullName(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(tempPassword));
        user.setRole(Role.STAFF);
        user.setActive(true);
        user.setPasswordChangeRequired(true);

        userRepository.save(user);

        emailService.sendWelcomeEmail(signUpRequest.getEmail(), tempPassword);

        // Cleanup OTP
        otpVerificationRepository.deleteByEmail(signUpRequest.getEmail());

        return ResponseEntity.ok(ApiResponse.success(null,
                "Staff Admin registered successfully! They have been sent an email with their temporary password."));
    }

    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<List<User>>> getAllStaff() {
        List<User> staff = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STAFF)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(staff, "Fetched all staff members"));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<String>> deleteStaff(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Staff removed successfully"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Staff not found", "USER_NOT_FOUND"));
    }
}
