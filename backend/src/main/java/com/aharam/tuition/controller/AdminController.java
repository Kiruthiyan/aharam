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
        for(int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    @PostMapping("/staff/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Error: Email is already registered!");
        }

        String otp = generateOtp();
        
        OtpVerification otpEntity = new OtpVerification();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiry(LocalDateTime.now().plusMinutes(15));
        otpEntity.setVerified(false);
        
        otpVerificationRepository.save(otpEntity);
        
        emailService.sendOtpEmail(email, otp, "Staff Registration");
        
        return ResponseEntity.ok("Verification code sent to " + email);
    }

    @PostMapping("/staff/verify-email-code")
    public ResponseEntity<?> verifyEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Email and OTP are required");
        }

        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);
        
        if (otpOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No verification code found for this email");
        }
        
        OtpVerification otpEntity = otpOpt.get();
        
        if (otpEntity.isExpired()) {
            return ResponseEntity.badRequest().body("Verification code has expired");
        }
        
        if (!otpEntity.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body("Invalid verification code");
        }
        
        otpEntity.setVerified(true);
        otpVerificationRepository.save(otpEntity);
        
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/staff/register")
    public ResponseEntity<?> registerStaff(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }
        
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(signUpRequest.getEmail());
        if (otpOpt.isEmpty() || !otpOpt.get().isVerified()) {
            return ResponseEntity.badRequest().body("Error: Email has not been verified!");
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

        return ResponseEntity.ok("Staff Admin registered successfully! They have been sent an email with their temporary password.");
    }

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.STAFF)
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
