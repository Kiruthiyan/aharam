package com.aharam.tuition.service;

import com.aharam.tuition.dto.StaffRegisterRequest;
import com.aharam.tuition.entity.OtpVerification;
import com.aharam.tuition.entity.Role;
import com.aharam.tuition.entity.User;
import com.aharam.tuition.exception.BusinessException;
import com.aharam.tuition.repository.OtpVerificationRepository;
import com.aharam.tuition.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class StaffService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder encoder;

    public String sendVerificationCode(String email) {
        email = normalizeEmail(email);
        if (email == null || email.isBlank()) {
            throw new BusinessException("Email is required.", "EMAIL_REQUIRED", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email is already registered.", "EMAIL_EXISTS", HttpStatus.BAD_REQUEST);
        }

        String otp = generateOtp();

        OtpVerification otpEntity = new OtpVerification();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setExpiry(LocalDateTime.now().plusMinutes(15));
        otpEntity.setVerified(false);
        otpVerificationRepository.save(otpEntity);

        emailService.sendOtpEmail(email, otp, "Staff Registration");
        return "Verification code sent to " + email;
    }

    public String verifyEmailCode(String email, String otp) {
        email = normalizeEmail(email);
        otp = otp == null ? null : otp.trim();
        if (email == null || email.isBlank() || otp == null || otp.isBlank()) {
            throw new BusinessException("Email and OTP are required.", "MISSING_FIELDS", HttpStatus.BAD_REQUEST);
        }

        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(email);
        OtpVerification otpEntity = otpOpt.orElseThrow(
                () -> new BusinessException("No verification code found for this email.", "NO_OTP_FOUND",
                        HttpStatus.BAD_REQUEST));

        if (otpEntity.isExpired()) {
            throw new BusinessException("Verification code has expired.", "OTP_EXPIRED", HttpStatus.BAD_REQUEST);
        }

        if (!otpEntity.getOtp().equals(otp)) {
            throw new BusinessException("Invalid verification code.", "INVALID_OTP", HttpStatus.BAD_REQUEST);
        }

        otpEntity.setVerified(true);
        otpVerificationRepository.save(otpEntity);
        return "Email verified successfully.";
    }

    public String registerStaff(StaffRegisterRequest signUpRequest) {
        if (signUpRequest == null || signUpRequest.getEmail() == null || signUpRequest.getEmail().isBlank()) {
            throw new BusinessException("Email is required.", "EMAIL_REQUIRED", HttpStatus.BAD_REQUEST);
        }
        if (signUpRequest.getUsername() == null || signUpRequest.getUsername().isBlank()) {
            throw new BusinessException("Username is required.", "USERNAME_REQUIRED", HttpStatus.BAD_REQUEST);
        }

        String normalizedEmail = normalizeEmail(signUpRequest.getEmail());
        String normalizedName = signUpRequest.getUsername().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("Email is already taken.", "EMAIL_EXISTS", HttpStatus.BAD_REQUEST);
        }

        Optional<OtpVerification> otpOpt = otpVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(normalizedEmail);
        if (otpOpt.isEmpty() || !otpOpt.get().isVerified()) {
            throw new BusinessException("Email has not been verified.", "EMAIL_NOT_VERIFIED", HttpStatus.BAD_REQUEST);
        }

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setFullName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPassword(encoder.encode(tempPassword));
        user.setRole(Role.STAFF);
        user.setActive(true);
        user.setPasswordChangeRequired(true);
        userRepository.save(user);

        emailService.sendWelcomeEmail(normalizedEmail, tempPassword);
        otpVerificationRepository.deleteByEmail(normalizedEmail);

        return "Staff registered successfully. Temporary credentials sent by email.";
    }

    public List<User> getAllStaff() {
        return userRepository.findByRole(Role.STAFF);
    }

    public void softDeleteStaff(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Staff not found."));
        if (user.getRole() != Role.STAFF) {
            throw new BusinessException("Only staff accounts can be removed via this endpoint.",
                    "INVALID_STAFF_DELETE",
                    HttpStatus.BAD_REQUEST);
        }
        userRepository.delete(user);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int num = random.nextInt(900000) + 100000;
        return String.valueOf(num);
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%^&*";
        String all = upper + lower + digits + special;

        StringBuilder sb = new StringBuilder();
        sb.append(upper.charAt(random.nextInt(upper.length())));
        sb.append(lower.charAt(random.nextInt(lower.length())));
        sb.append(digits.charAt(random.nextInt(digits.length())));
        sb.append(special.charAt(random.nextInt(special.length())));

        for (int i = 0; i < 4; i++) {
            sb.append(all.charAt(random.nextInt(all.length())));
        }

        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        sb = new StringBuilder(chars.length);
        for (char c : chars) {
            sb.append(c);
        }
        return sb.toString();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
