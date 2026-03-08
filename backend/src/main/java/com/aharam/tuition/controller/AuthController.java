package com.aharam.tuition.controller;

import com.aharam.tuition.dto.ApiResponse;
import com.aharam.tuition.dto.ForgotPasswordRequest;
import com.aharam.tuition.dto.JwtResponse;
import com.aharam.tuition.dto.LoginRequest;
import com.aharam.tuition.dto.ResetPasswordRequest;
import com.aharam.tuition.dto.SignupRequest;
import com.aharam.tuition.dto.ChangePasswordRequest;
import com.aharam.tuition.dto.VerifyOtpRequest;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.exception.BusinessException;
import com.aharam.tuition.repository.UserRepository;
import com.aharam.tuition.security.JwtUtils;
import com.aharam.tuition.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

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
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String loginId = loginRequest.getLoginId().trim();
        User user = userRepository.findByUsername(loginId)
                .or(() -> userRepository.findByEmail(loginId))
                .orElse(null);

        if (user != null) {
            if (!user.isActive()) {
                return ResponseEntity.status(401).body(ApiResponse.error("Account is inactive.", "ACCOUNT_INACTIVE"));
            }
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginId, loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            String displayName = user != null ? user.getFullName() : loginId;

            JwtResponse resp = new JwtResponse(
                    jwt,
                    user != null ? user.getId() : 0L,
                    user != null ? user.getUsername() : loginId,
                    displayName,
                    user != null ? user.getRole().name() : "",
                    user != null ? user.isPasswordChangeRequired() : false);

            return ResponseEntity.ok(ApiResponse.success(resp, "Login successful"));

        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials.", "AUTH_FAILED"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String email = normalizeEmail(signUpRequest.getEmail());
        String username = signUpRequest.getUsername().trim();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is already registered.", "EMAIL_EXISTS"));
        }

        User user = new User();
        user.setFullName(username);
        user.setEmail(email);
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
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByUsername(request.getUsername().trim())
                .or(() -> userRepository.findByEmail(request.getUsername().trim()))
                .orElseThrow(() -> new EntityNotFoundException("User not found."));

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
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(request.getEmail().trim()))
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address or login ID.", "USER_NOT_FOUND"));
        }

        String otp = generateOtp();
        user.setPasswordResetToken(otp);
        user.setPasswordResetExpires(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        emailService.sendOtpEmail(email, otp, "Password Reset");

        return ResponseEntity.ok(ApiResponse.success(null, "Password reset OTP sent to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = normalizeOtp(request.getOtp());

        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(request.getEmail().trim()))
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address or login ID.", "USER_NOT_FOUND"));
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
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String email = normalizeEmail(request.getEmail());
        String otp = normalizeOtp(request.getOtp());
        String newPassword = request.getNewPassword();

        User user = userRepository.findByEmail(email)
                .or(() -> userRepository.findByUsername(request.getEmail().trim()))
                .orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No account found with that email address or login ID.", "USER_NOT_FOUND"));
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

    private String normalizeEmail(String value) {
        if (value == null) {
            throw new BusinessException("Email is required.", "EMAIL_REQUIRED", HttpStatus.BAD_REQUEST);
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeOtp(String value) {
        if (value == null) {
            throw new BusinessException("OTP is required.", "INVALID_OTP_FORMAT", HttpStatus.BAD_REQUEST);
        }
        return value.trim();
    }
}
